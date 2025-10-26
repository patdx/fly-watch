import { env } from 'cloudflare:workers'
import { once } from 'lodash-es'
import { DiscordNotifier } from '../discord.js'
import { FlyAPIClient } from '../fly-api.js'
import { FlyMachineMonitor } from '../monitor.js'
import { StorageD1 } from '../storage-d1'

// Environment configuration for Worker runtime
const LOG_LEVEL = 'info'

const getMonitor = once(async () => {
	const storage = new StorageD1(env.DB)
	await storage.initialize()

	const apiClient = new FlyAPIClient(
		env.FLY_API_TOKEN,
		env.FLY_ORG_SLUG,
		LOG_LEVEL,
	)
	const discord = new DiscordNotifier(env.DISCORD_WEBHOOK_URL, LOG_LEVEL)
	const monitor = new FlyMachineMonitor(apiClient, discord, storage, LOG_LEVEL)

	return monitor
})

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)
		if (url.pathname === '/health') {
			return new Response('OK', { status: 200 })
		}

		// if (url.pathname === '/cron-test') {
		// 	const monitor = await getMonitor()
		// 	await monitor.start()
		// 	return new Response('Cron job executed', { status: 200 })
		// }

		return new Response('Not Found', { status: 404 })
	},
	async scheduled(event, env, ctx) {
		const monitor = await getMonitor()
		await monitor.start()
	},
} satisfies ExportedHandler<Env>
