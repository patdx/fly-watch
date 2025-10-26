import { Kysely } from 'kysely'
import type {
	FlyCheckerDatabase,
	Machine,
	StateChangeEvent,
	StoredMachine,
} from './types.js'
import { StorageInterface } from './storage-interface.js'

export abstract class SQLiteStorageBase extends StorageInterface {
	protected db: Kysely<FlyCheckerDatabase>

	constructor(db: Kysely<FlyCheckerDatabase>) {
		super()
		this.db = db
	}

	async initialize(): Promise<void> {
		try {
			await this.db.schema
				.createTable('machines')
				.ifNotExists()
				.addColumn('id', 'text', (col) => col.primaryKey())
				.addColumn('app_name', 'text', (col) => col.notNull())
				.addColumn('name', 'text', (col) => col.notNull())
				.addColumn('last_state', 'text', (col) => col.notNull())
				.addColumn('last_updated', 'integer', (col) => col.notNull())
				.addColumn('region', 'text')
				.addColumn('instance_id', 'text')
				.addColumn('last_processed_event_timestamp', 'integer')
				.execute()

			await this.db.schema
				.createTable('events')
				.ifNotExists()
				.addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
				.addColumn('machine_id', 'text', (col) => col.notNull())
				.addColumn('event_type', 'text', (col) => col.notNull())
				.addColumn('previous_state', 'text')
				.addColumn('new_state', 'text', (col) => col.notNull())
				.addColumn('timestamp', 'integer', (col) => col.notNull())
				.addColumn('notified', 'boolean', (col) => col.defaultTo(false))
				.addForeignKeyConstraint('fk_machine', ['machine_id'], 'machines', [
					'id',
				])
				.execute()

			console.log('Database initialized successfully')
		} catch (error) {
			console.log(
				'Database initialization completed (tables may already exist)',
			)
		}
	}

	async upsertMachine(
		machine: Machine,
		lastProcessedEventId?: string,
	): Promise<void> {
		await this.db
			.insertInto('machines')
			.values({
				id: machine.id,
				app_name: machine.app_name,
				name: machine.name,
				last_state: machine.state,
				last_updated: Date.now(),
				region: machine.region,
				instance_id: machine.instance_id,
				last_processed_event_timestamp: lastProcessedEventId
					? parseInt(lastProcessedEventId)
					: undefined,
			})
			.onConflict((oc) =>
				oc.column('id').doUpdateSet({
					app_name: machine.app_name,
					name: machine.name,
					last_state: machine.state,
					last_updated: Date.now(),
					region: machine.region,
					instance_id: machine.instance_id,
					last_processed_event_timestamp: lastProcessedEventId
						? parseInt(lastProcessedEventId)
						: undefined,
				}),
			)
			.execute()
	}

	async updateLastProcessedEvent(
		machineId: string,
		eventTimestamp: string,
	): Promise<void> {
		await this.db
			.updateTable('machines')
			.set({ last_processed_event_timestamp: parseInt(eventTimestamp) })
			.where('id', '=', machineId)
			.execute()
	}

	async getAllStoredMachines(): Promise<StoredMachine[]> {
		const results = await this.db.selectFrom('machines').selectAll().execute()
		return results.map((row) => ({
			id: row.id,
			name: row.name,
			state: row.last_state,
			region: row.region || '',
			instance_id: row.instance_id || '',
			app_name: row.app_name,
			created_at: new Date(row.last_updated).toISOString(),
			updated_at: new Date(row.last_updated).toISOString(),
			events: [],
			last_processed_event_timestamp: row.last_processed_event_timestamp,
		}))
	}

	async recordEvent(event: StateChangeEvent): Promise<number> {
		const result = await this.db
			.insertInto('events')
			.values({
				machine_id: event.machine_id,
				event_type: event.event_type,
				previous_state: event.previous_state || undefined,
				new_state: event.new_state,
				timestamp: event.timestamp,
				notified: event.notified,
			})
			.executeTakeFirst()

		return Number(result.insertId!)
	}

	async getUnnotifiedEvents(): Promise<StateChangeEvent[]> {
		return await this.db
			.selectFrom('events')
			.selectAll()
			.where('notified', '=', false)
			.execute()
	}

	async markEventAsNotified(eventId: number): Promise<void> {
		await this.db
			.updateTable('events')
			.set({ notified: true })
			.where('id', '=', eventId)
			.execute()
	}
}
