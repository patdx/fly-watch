# Agent Guidelines for my-fly-checker

Fly.io machine monitoring service that tracks billing-relevant events (start/stop/suspend) and sends alerts via Discord. Built with Bun for development, deployed as Cloudflare Workers cron job.

## Commands

- **Install dependencies**: `bun install`
- **Run main file**: `bun run src/bun/main.ts`
- **Run tests**: `bun test`
- **Run single test**: `bun test --test-name-pattern "test name"`
- **Type check**: `bun tsc --noEmit`
- **Format**: `bun run format` (prettier --write .)
- **Format check**: `bun run format:check`

## Code Style

- Use Bun runtime instead of Node.js
- TypeScript with strict mode enabled, ESNext target
- Import TypeScript files directly with .js extensions (verbatimsyntax)
- Use `bun:sqlite`, `Bun.redis`, `Bun.serve()` instead of Node equivalents
- Prettier config: no semicolons, single quotes
- Kysely for database operations with abstract storage interface
- Test files end with `.test.ts`, use `bun:test` framework
- Environment variables for API tokens and configuration
- Follow existing naming conventions (camelCase for variables, PascalCase for types)

## Implementation Requirements

- Check Fly.io recent events API, not just current status
- Track last known event to detect changes
- Report start/stop/suspend status changes
- Send alerts to custom Discord channel
- Store event history to prevent duplicate alerts
- Use environment variables for API tokens
- Use abstract storage interface for easy storage backend swapping

## Project Structure

- Development entry point: `src/bun/main.ts`
- Production entry point: `src/worker/main.ts` (Cloudflare Workers cron job)
- Storage interface: `storage-interface.ts` (abstract class)
- Storage implementations: `storage-bun.ts`, `storage-d1.ts` (SQLite/D1 with Kysely)
- Module type: ESM
- Private project with TypeScript peer dependency
