// Database table types
export interface MachineTable {
	id: string
	app_name: string
	name: string
	last_state: string
	last_updated: number
	region?: string
	instance_id?: string
	last_processed_event_timestamp?: number
}

export interface EventTable {
	id: Generated<number>
	machine_id: string
	event_type: string
	previous_state?: string
	new_state: string
	timestamp: number
	notified: boolean
}

export interface FlyCheckerDatabase {
	machines: MachineTable
	events: EventTable
}

// Fly.io API types
export interface FlyEvent {
	id: string
	type: string
	status: string
	source: string
	timestamp: number
	request?: any
}

export interface Machine {
	id: string
	name: string
	state: string
	region: string
	instance_id: string
	app_name: string
	created_at: string
	updated_at: string
	events: FlyEvent[]
}

// Application types
export interface StateChangeEvent {
	id?: number
	machine_id: string
	event_type: string
	previous_state?: string
	new_state: string
	timestamp: number
	notified: boolean
}

export interface StoredMachine extends Machine {
	last_processed_event_timestamp?: number
}

// Re-export Generated from kysely for convenience
import type { Generated } from 'kysely'
export type { Generated }
