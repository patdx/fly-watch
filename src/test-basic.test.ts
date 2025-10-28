import { describe, it, expect } from 'bun:test'
import { TelegramNotifier } from './telegram'

describe('Basic Functionality', () => {
	it('should use correct emojis for different states', () => {
		const telegram = new TelegramNotifier('test_token', 'test_chat_id')

		// Test different state emojis
		expect(telegram.getStateEmoji('started')).toBe('🟢')
		expect(telegram.getStateEmoji('stopped')).toBe('🔴')
		expect(telegram.getStateEmoji('suspended')).toBe('⏸️')
		expect(telegram.getStateEmoji('failed')).toBe('❌')
		expect(telegram.getStateEmoji('unknown')).toBe('⚪')
	})
})
