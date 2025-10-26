// Logging utility (shared across modules)
export function log(
	level: 'debug' | 'info' | 'warn' | 'error',
	message: string,
	currentLogLevel: string = 'info',
) {
	const timestamp = new Date().toISOString()
	const shouldLog =
		currentLogLevel === 'debug' ||
		(currentLogLevel === 'info' && level !== 'debug') ||
		(currentLogLevel === 'warn' && ['warn', 'error'].includes(level)) ||
		(currentLogLevel === 'error' && level === 'error')

	if (shouldLog) {
		console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`)
	}
}
