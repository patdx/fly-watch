import { Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import type { FlyCheckerDatabase } from './types.js'
import { SQLiteStorageBase } from './storage-base.js'

export class StorageD1 extends SQLiteStorageBase {
	constructor(d1Database: D1Database) {
		const db = new Kysely<FlyCheckerDatabase>({
			dialect: new D1Dialect({ database: d1Database }),
		})
		super(db)
	}
}
