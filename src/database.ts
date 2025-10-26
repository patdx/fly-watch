import { Kysely } from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-sqlite'
import { Database } from 'bun:sqlite'
import type { FlyCheckerDatabase } from './types.js'

const db = new Kysely<FlyCheckerDatabase>({
	dialect: new BunSqliteDialect({
		database: new Database('fly-checker.db'),
	}),
})

// Initialize database schema
export async function initializeDatabase() {
	try {
		// Create machines table to track last known state
		await db.schema
			.createTable('machines')
			.ifNotExists()
			.addColumn('id', 'text', (col) => col.primaryKey())
			.addColumn('app_name', 'text', (col) => col.notNull())
			.addColumn('name', 'text', (col) => col.notNull())
			.addColumn('last_state', 'text', (col) => col.notNull())
			.addColumn('last_updated', 'integer', (col) => col.notNull())
			.addColumn('region', 'text')
			.addColumn('instance_id', 'text')
			.addColumn('last_processed_event_id', 'text')
			.execute()

		// Create events table to track state changes and notifications
		await db.schema
			.createTable('events')
			.ifNotExists()
			.addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
			.addColumn('machine_id', 'text', (col) => col.notNull())
			.addColumn('event_type', 'text', (col) => col.notNull())
			.addColumn('previous_state', 'text')
			.addColumn('new_state', 'text', (col) => col.notNull())
			.addColumn('timestamp', 'integer', (col) => col.notNull())
			.addColumn('notified', 'boolean', (col) => col.defaultTo(false))
			.addForeignKeyConstraint('fk_machine', ['machine_id'], 'machines', ['id'])
			.execute()

		console.log('Database initialized successfully')
	} catch (error) {
		// Table might already exist, which is fine
		console.log('Database initialization completed (tables may already exist)')
	}
}

export default db
