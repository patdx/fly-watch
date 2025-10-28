import type { NotifierInterface } from './notifier-interface.js'
import type { FlyAPIClient } from './fly-api.js'
import type { StorageInterface } from './storage-interface.js'
import type { FlyEvent, Machine } from './types.js'
import { log } from './utils.js'

export class FlyMachineMonitor {
	private apiClient: FlyAPIClient
	private notifier: NotifierInterface
	private storage: StorageInterface
	private logLevel: string

	constructor(
		apiClient: FlyAPIClient,
		notifier: NotifierInterface,
		storage: StorageInterface,
		logLevel: string = 'info',
	) {
		this.apiClient = apiClient
		this.notifier = notifier
		this.storage = storage
		this.logLevel = logLevel
	}

	async checkAllMachines() {
		log('info', 'Starting machine status check', this.logLevel)

		try {
			// Get all apps
			const appsResponse = await this.apiClient.getApps()

			console.log(appsResponse)

			log('info', `Found ${appsResponse.total_apps} apps`, this.logLevel)

			const allMachines: Machine[] = []

			// Get machines for each app
			for (const app of appsResponse.apps) {
				try {
					const machines = await this.apiClient.getMachines(app.name)
					allMachines.push(...machines)
					log(
						'info',
						`Found ${machines.length} machines in app ${app.name}`,
						this.logLevel,
					)
				} catch (error) {
					log(
						'error',
						`Failed to get machines for app ${app.name}: ${error}`,
						this.logLevel,
					)
				}
			}

			// Process events for each machine
			await this.processMachineEvents(allMachines)

			log('info', `Processed ${allMachines.length} machines`, this.logLevel)
		} catch (error) {
			log('error', `Machine check failed: ${error}`, this.logLevel)
		}
	}

	private async processMachineEvents(currentMachines: Machine[]) {
		const storedMachines = await this.storage.getAllStoredMachines()
		const storedMap = new Map(storedMachines.map((m) => [m.id, m]))

		// First pass: process events
		for (const machine of currentMachines) {
			const stored = storedMap.get(machine.id)
			const lastProcessedTimestamp = stored?.last_processed_event_timestamp

			// Filter events after last processed
			const newEvents = machine.events.filter(
				(e) =>
					!lastProcessedTimestamp ||
					this.isEventAfter(e, lastProcessedTimestamp),
			)

			if (newEvents.length > 0) {
				log(
					'info',
					`Processing ${newEvents.length} new events for machine ${machine.name}`,
					this.logLevel,
				)

				// Sort events by timestamp to process in chronological order
				newEvents.sort((a, b) => a.timestamp - b.timestamp)

				// Process in chronological order
				for (const event of newEvents) {
					await this.handleEvent(machine, event)
				}

				// Update last processed event timestamp to the latest event
				const latestEvent = newEvents.reduce(
					(latest, current) =>
						current.timestamp > latest.timestamp ? current : latest,
					newEvents[0]!,
				)
				if (latestEvent) {
					await this.storage.updateLastProcessedEvent(
						machine.id,
						latestEvent.timestamp.toString(),
					)
				}
			}
		}

		// Second pass: update machine states
		for (const machine of currentMachines) {
			const stored = storedMap.get(machine.id)

			// Find the latest event timestamp from all events
			const latestEvent = machine.events.reduce(
				(latest, current) =>
					current.timestamp > latest.timestamp ? current : latest,
				machine.events[0]!,
			)

			const lastProcessedEventTimestamp = latestEvent
				? latestEvent.timestamp.toString()
				: stored?.last_processed_event_timestamp?.toString()

			await this.storage.upsertMachine(machine, lastProcessedEventTimestamp)
		}
	}

	private isEventAfter(
		event: FlyEvent,
		lastProcessedTimestamp: number,
	): boolean {
		// Compare timestamps for reliable ordering
		return event.timestamp > lastProcessedTimestamp
	}

	private async handleEvent(machine: Machine, event: FlyEvent) {
		const isBillingRelevant = this.isBillingRelevantEvent(event)

		if (isBillingRelevant) {
			log(
				'info',
				`Billing-relevant event: ${machine.name} ${event.type} (${event.status})`,
				this.logLevel,
			)

			// Ensure machine exists before recording event (foreign key constraint)
			await this.storage.upsertMachine(machine)

			// Record the event
			const eventId = await this.storage.recordEvent({
				machine_id: machine.id,
				event_type: event.type,
				new_state: event.status,
				timestamp: event.timestamp,
				notified: false,
			})

			// Send notification
			const message = this.notifier.formatEvent(machine, event)
			await this.notifier.sendAlert(message)

			// Mark this specific event as notified
			if (eventId) {
				await this.storage.markEventAsNotified(eventId)
			}
		}
	}

	private isBillingRelevantEvent(event: FlyEvent): boolean {
		const billingRelevantTypes = ['start', 'stop', 'exit']
		return billingRelevantTypes.includes(event.type)
	}

	async start() {
		log('info', 'Starting Fly Machine Monitor', this.logLevel)

		// Run check once
		await this.checkAllMachines()

		log('info', 'Machine check completed. Exiting.', this.logLevel)
	}
}
