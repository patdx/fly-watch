# Fly Machine Monitor

Monitors personal Fly.io development servers to prevent runaway costs. Since Fly.io lacks webhook APIs for machine events, this service polls the events API and sends Discord alerts for billing-relevant activity. Built with Bun for development, deployed as Cloudflare Workers cron job.

## Features

- Polls Fly.io events API (no webhook support available)
- Detects billing-relevant events (start/stop/exit)
- Sends Discord alerts for cost monitoring
- Prevents duplicate notifications via event tracking
- Abstract storage interface (SQLite/D1)
- Configurable polling intervals
- Cloudflare Workers deployment for reliability

## Setup

### 1. Install

```bash
bun install
```

### 2. Configure Environment

```bash
cp .env .env.local
```

Edit `.env.local` with your values (git-ignored):

```bash
FLY_API_TOKEN=your_fly_api_token_here
FLY_ORG_SLUG=your_fly_organization_slug
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
LOG_LEVEL=info
```

### 3. Get Fly.io API Token

```bash
fly tokens create readonly --name "fly-machine-monitor"
```

### 4. Set Up Discord Webhook

Create webhook in Discord server settings and add URL to `.env.local`.

## Usage

### Development

```bash
bun run start
```

### Production Deployment

```bash
bun run cf-deploy
```

### Local Workers Development

```bash
bun run cf-dev
```

## Environment Variables

| Variable              | Required | Description              | Default |
| --------------------- | -------- | ------------------------ | ------- |
| `FLY_API_TOKEN`       | Yes      | Fly.io API token         | -       |
| `FLY_ORG_SLUG`        | Yes      | Fly.io organization slug | -       |
| `DISCORD_WEBHOOK_URL` | Yes      | Discord webhook URL      | -       |
| `LOG_LEVEL`           | No       | Logging level            | `info`  |

## Monitored Events

Billing-relevant event types:

- start
- stop
- exit

## Storage

Abstract storage interface with multiple backends:

- **Development**: SQLite via `storage-bun.ts`
- **Production**: Cloudflare D1 via `storage-d1.ts`

Both use identical schema with `machines` and `events` tables for tracking state changes and notification history.

## Development

```bash
bun test                    # Run tests
bun test --test-name-pattern "name"  # Run specific test
bun tsc --noEmit            # Type check
bun run format              # Format code
bun run format:check        # Check formatting
```

## Project Structure

- `src/bun/main.ts` - Development entry point
- `src/worker/main.ts` - Production entry point
- `src/storage-interface.ts` - Abstract storage interface
- `src/storage-bun.ts` - SQLite implementation
- `src/storage-d1.ts` - D1 implementation
- `src/*.test.ts` - Test files

## TODO

- [ ] Cap events table to prevent unlimited growth
- [ ] Add configurable retention period for events
- [ ] Implement cleanup job for old events
- [ ] Add metrics/monitoring for the service itself
- [ ] Support multiple Discord channels per app
- [ ] Add machine cost estimation
- [ ] Implement alert rate limiting

## License

Private project.
