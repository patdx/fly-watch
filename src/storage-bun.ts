import { Kysely } from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-sqlite'
import { Database } from 'bun:sqlite'
import type { FlyCheckerDatabase } from './types.js'
import { SQLiteStorageBase } from './storage-base.js'

export class StorageBun extends SQLiteStorageBase {
	constructor(dbPath: string = 'fly-checker.db') {
		const bunDb = new Database(dbPath)
		bunDb.run('PRAGMA foreign_keys = ON;') // Enable foreign key enforcement
		bunDb.run('PRAGMA journal_mode = WAL;')
		const db = new Kysely<FlyCheckerDatabase>({
			dialect: new BunSqliteDialect({
				database: bunDb,
			}),
		})
		super(db)
	}
}
