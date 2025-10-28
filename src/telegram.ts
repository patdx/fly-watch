import type { FlyEvent, Machine } from './types.js'
import type { NotifierInterface } from './notifier-interface.js'
import { log } from './utils.js'

export class TelegramNotifier implements NotifierInterface {
	private botToken: string
	private chatId: string
	private logLevel: string

	constructor(botToken: string, chatId: string, logLevel: string = 'info') {
		this.botToken = botToken
		this.chatId = chatId
		this.logLevel = logLevel
	}

	async sendAlert(message: string) {
		try {
			const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`

			const payload = {
				chat_id: this.chatId,
				text: message,
				parse_mode: 'Markdown',
			}

			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				const errorData = (await response.json()) as { description?: string }
				throw new Error(
					`Telegram API failed: ${response.status} - ${errorData.description || 'Unknown error'}`,
				)
			}

			log('info', 'Telegram notification sent successfully', this.logLevel)
		} catch (error) {
			log(
				'error',
				`Failed to send Telegram notification: ${error}`,
				this.logLevel,
			)
		}
	}

	public formatEvent(machine: Machine, event: FlyEvent): string {
		const emoji = this.getStateEmoji(event.status)
		const eventTime = new Date(event.timestamp).toISOString()

		return (
			`${emoji} *Machine Event*\n` +
			`*App:* ${machine.app_name}\n` +
			`*Machine:* ${machine.name} (${machine.id.slice(0, 8)})\n` +
			`*Region:* ${machine.region}\n` +
			`*Event:* ${event.type} (${event.status})\n` +
			`*Source:* ${event.source}\n` +
			`*Time:* ${eventTime}`
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
