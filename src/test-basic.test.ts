import { describe, it, expect } from 'bun:test'
import { DiscordNotifier } from './discord'

describe('Basic Functionality', () => {
	it('should use correct emojis for different states', () => {
		const discord = new DiscordNotifier('https://discord.com/webhook/test')

		// Test different state emojis
		expect(discord.getStateEmoji('started')).toBe('🟢')
		expect(discord.getStateEmoji('stopped')).toBe('🔴')
		expect(discord.getStateEmoji('suspended')).toBe('⏸️')
		expect(discord.getStateEmoji('failed')).toBe('❌')
		expect(discord.getStateEmoji('unknown')).toBe('⚪')
	})
})
