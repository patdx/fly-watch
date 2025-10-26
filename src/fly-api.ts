import type { Machine } from './types.js'
import { log } from './utils.js'

const FLY_API_HOSTNAME = 'https://api.machines.dev'

export class FlyAPIClient {
	private baseURL: string
	private headers: Record<string, string>
	private logLevel: string
	private orgSlug: string

	constructor(apiToken?: string, orgSlug?: string, logLevel: string = 'info') {
		this.baseURL = FLY_API_HOSTNAME
		this.logLevel = logLevel
		this.orgSlug = orgSlug || ''
		this.headers = {
			Authorization: `Bearer ${apiToken}`,
			'Content-Type': 'application/json',
		}
	}

	async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`

		try {
			log('info', `Making request to: ${url}`, this.logLevel)
			const response = await fetch(url, {
				...options,
				headers: { ...this.headers, ...options.headers },
			})

			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}: ${response.statusText}`

				// Try to get more error details from response body
				try {
					const errorBody = await response.text()
					if (errorBody) {
						errorMessage += ` - ${errorBody}`
					}
				} catch (e) {
					// Ignore error body parsing errors
				}

				throw new Error(errorMessage)
			}

			const responseData = await response.json()
			console.log(JSON.stringify(responseData, null, 2))
			return responseData as T
		} catch (error) {
			log('error', `API request failed: ${error}`, this.logLevel)
			throw error
		}
	}

	async getApps(): Promise<{
		total_apps: number
		apps: Array<{
			id: string
			name: string
			machine_count: number
			volume_count: number
			network: string
		}>
	}> {
		return this.makeRequest<{
			total_apps: number
			apps: Array<{
				id: string
				name: string
				machine_count: number
				volume_count: number
				network: string
			}>
		}>('/v1/apps?org_slug=' + this.orgSlug)
	}

	async getMachines(appName: string): Promise<Machine[]> {
		const machines = await this.makeRequest<Machine[]>(
			`/v1/apps/${appName}/machines`,
		)
		// Add app_name to each machine since it's not included in the API response
		return machines.map((machine) => ({
			...machine,
			app_name: appName,
		}))
	}
}
