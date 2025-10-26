import { Database } from 'bun:sqlite'
import { describe, it, expect, beforeEach, afterEach } from 'bun:test'

// Test database functions in isolation
describe('Database Operations', () => {
	let db: Database

	beforeEach(() => {
		db = new Database(':memory:')

		// Initialize schema
		db.run(`
      CREATE TABLE IF NOT EXISTS machines (
        id TEXT PRIMARY KEY,
        app_name TEXT NOT NULL,
        name TEXT NOT NULL,
        last_state TEXT NOT NULL,
        last_updated INTEGER NOT NULL,
        region TEXT,
        instance_id TEXT
      )
    `)

		db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        previous_state TEXT,
        new_state TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        notified BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (machine_id) REFERENCES machines (id)
      )
    `)
	})

	afterEach(() => {
		db.close()
	})

	it('should store and retrieve machine data', () => {
		const machine = {
			id: 'test-machine-1',
			app_name: 'test-app',
			name: 'test-machine',
			state: 'started',
			region: 'ord',
			instance_id: 'test-instance',
		}

		// Insert machine
		const stmt = db.prepare(`
      INSERT OR REPLACE INTO machines (id, app_name, name, last_state, last_updated, region, instance_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

		stmt.run(
			machine.id,
			machine.app_name,
			machine.name,
			machine.state,
			Date.now(),
			machine.region,
			machine.instance_id,
		)

		// Retrieve machine
		const retrieveStmt = db.prepare('SELECT * FROM machines WHERE id = ?')
		const result = retrieveStmt.get(machine.id) as any

		expect(result).toBeDefined()
		expect(result.id).toBe(machine.id)
		expect(result.app_name).toBe(machine.app_name)
		expect(result.last_state).toBe(machine.state)
	})

	it('should store and retrieve event data', () => {
		const event = {
			machine_id: 'test-machine-1',
			event_type: 'state_change',
			previous_state: 'stopped',
			new_state: 'started',
			timestamp: Date.now(),
			notified: false,
		}

		// Insert event
		const stmt = db.prepare(`
      INSERT INTO events (machine_id, event_type, previous_state, new_state, timestamp, notified)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

		stmt.run(
			event.machine_id,
			event.event_type,
			event.previous_state,
			event.new_state,
			event.timestamp,
			event.notified,
		)

		// Retrieve event
		const retrieveStmt = db.prepare('SELECT * FROM events WHERE machine_id = ?')
		const result = retrieveStmt.get(event.machine_id) as any

		expect(result).toBeDefined()
		expect(result.machine_id).toBe(event.machine_id)
		expect(result.event_type).toBe(event.event_type)
		expect(result.new_state).toBe(event.new_state)
		expect(result.notified).toBe(0)
	})
})
