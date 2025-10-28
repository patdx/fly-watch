import { StorageBun } from '../storage-bun.js'
import { FlyMachineMonitor } from '../monitor.js'
import { FlyAPIClient } from '../fly-api.js'
import { TelegramNotifier } from '../telegram.js'
import { log } from '../utils.js'

// Environment configuration for Bun runtime
const FLY_API_TOKEN = process.env.FLY_API_TOKEN!
const FLY_ORG_SLUG = process.env.FLY_ORG_SLUG!
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!
const LOG_LEVEL = 'info'

// Create and export the default storage instance
export const storage = new StorageBun()

// Main execution
async function main() {
	await storage.initialize()

	const apiClient = new FlyAPIClient(FLY_API_TOKEN, FLY_ORG_SLUG, LOG_LEVEL)
	const telegram = new TelegramNotifier(
		TELEGRAM_BOT_TOKEN,
		TELEGRAM_CHAT_ID,
		LOG_LEVEL,
	)
	const monitor = new FlyMachineMonitor(apiClient, telegram, storage, LOG_LEVEL)
	await monitor.start()
}

// Handle graceful shutdown
process.on('SIGINT', () => {
	log('info', 'Shutting down gracefully', LOG_LEVEL)
	process.exit(0)
})

process.on('SIGTERM', () => {
	log('info', 'Shutting down gracefully', LOG_LEVEL)
	process.exit(0)
})

// Start the application
if (import.meta.main) {
	main().catch((error) => {
		log('error', `Application failed to start: ${error}`, LOG_LEVEL)
		process.exit(1)
	})
}
