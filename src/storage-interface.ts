import type { Machine, StateChangeEvent, StoredMachine } from './types.js'

export abstract class StorageInterface {
	abstract initialize(): Promise<void>

	// Machine operations
	abstract upsertMachine(
		machine: Machine,
		lastProcessedEventId?: string,
	): Promise<void>
	abstract updateLastProcessedEvent(
		machineId: string,
		eventId: string,
	): Promise<void>
	abstract getAllStoredMachines(): Promise<StoredMachine[]>

	// Event operations
	abstract recordEvent(event: StateChangeEvent): Promise<number>
	abstract getUnnotifiedEvents(): Promise<StateChangeEvent[]>
	abstract markEventAsNotified(eventId: number): Promise<void>
}
