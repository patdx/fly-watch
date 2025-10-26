import type { FlyEvent, Machine } from './types.js'
import { log } from './utils.js'

export class DiscordNotifier {
	private webhookURL: string
	private logLevel: string

	constructor(webhookURL: string, logLevel: string = 'info') {
		this.webhookURL = webhookURL
		this.logLevel = logLevel
	}

	async sendAlert(message: string) {
		try {
			const payload = {
				content: message,
				username: 'Fly Machine Monitor',
				avatar_url: 'https://fly.io/static/images/fly-logo.svg',
			}

			const response = await fetch(this.webhookURL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				throw new Error(`Discord webhook failed: ${response.status}`)
			}

			log('info', 'Discord notification sent successfully', this.logLevel)
		} catch (error) {
			log(
				'error',
				`Failed to send Discord notification: ${error}`,
				this.logLevel,
			)
		}
	}

	public formatEvent(machine: Machine, event: FlyEvent): string {
		const emoji = this.getStateEmoji(event.status)
		const eventTime = new Date(event.timestamp).toISOString()

		return (
			`${emoji} **Machine Event**\n` +
			`**App:** ${machine.app_name}\n` +
			`**Machine:** ${machine.name} (${machine.id.slice(0, 8)})\n` +
			`**Region:** ${machine.region}\n` +
			`**Event:** ${event.type} (${event.status})\n` +
			`**Source:** ${event.source}\n` +
			`**Time:** ${eventTime}`
		)
	}

	public getStateEmoji(state: string): string {
		switch (state) {
			case 'started':
				return '🟢'
			case 'stopped':
				return '🔴'
			case 'suspended':
				return '⏸️'
			case 'failed':
				return '❌'
			default:
				return '⚪'
		}
	}
}
