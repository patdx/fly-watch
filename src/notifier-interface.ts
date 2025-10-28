import type { FlyEvent, Machine } from './types.js'

export interface NotifierInterface {
	sendAlert(message: string): Promise<void>
	formatEvent(machine: Machine, event: FlyEvent): string
	getStateEmoji(state: string): string
}
