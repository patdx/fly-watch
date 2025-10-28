# Fly Machine Monitor

Monitors personal Fly.io development servers to prevent runaway costs. Since Fly.io lacks webhook APIs for machine events, this service polls the events API and sends Telegram alerts for billing-relevant activity. Built with Bun for development, deployed as Cloudflare Workers cron job.

**Note:** This project originally used Discord webhooks but was migrated to Telegram due to rate limiting issues when sending notifications from Cloudflare Workers. Telegram provides more reliable delivery for automated monitoring alerts.

## Features

- Polls Fly.io events API (no webhook support available)
- Detects billing-relevant events (start/stop/exit)
- Sends Telegram alerts for cost monitoring
- Prevents duplicate notifications via event tracking
- Abstract storage interface (SQLite/D1)
- Configurable polling intervals
- Cloudflare Workers deployment for reliability

## Setup

### 1. Install

```bash
pnpm install
```

### 2. Configure Environment

```bash
cp .env .env.local
```

Edit `.env.local` with your values (git-ignored):

```bash
FLY_API_TOKEN=your_fly_api_token_here
FLY_ORG_SLUG=your_fly_organization_slug
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
LOG_LEVEL=info
```

### 3. Get Fly.io API Token

```bash
fly tokens create readonly --name "fly-machine-monitor"
```

### 4. Set Up Telegram Bot

**Why Telegram?** Discord webhooks were getting rate limited when deployed on Cloudflare Workers, causing missed alerts. Telegram's bot API is more reliable for automated notifications.

**Step-by-step setup:**

1. **Create your bot:**
   - Open Telegram and search for **@BotFather**
   - Send `/newbot` command
   - Follow the prompts to name your bot (e.g., "Fly Machine Monitor")
   - BotFather will give you a **bot token** - save this!

2. **Get your Chat ID:**
   - Start a chat with your new bot by sending it any message
   - Visit this URL in your browser (replace `YOUR_BOT_TOKEN`):
     ```
     https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
     ```
   - Look for the `"chat":{"id":123456789}` field - that number is your chat ID

3. **Add to environment:**
   ```bash
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   ```

**Security tip:** Keep your bot token and chat ID private - they allow anyone to send messages through your bot.

## Usage

### Development

```bash
pnpm start
```

### Production Deployment

```bash
pnpm cf-deploy
```

### Local Workers Development

```bash
pnpm cf-dev
```

## Environment Variables

| Variable             | Required | Description              | Default |
| -------------------- | -------- | ------------------------ | ------- |
| `FLY_API_TOKEN`      | Yes      | Fly.io API token         | -       |
| `FLY_ORG_SLUG`       | Yes      | Fly.io organization slug | -       |
| `TELEGRAM_BOT_TOKEN` | Yes      | Telegram bot token       | -       |
| `TELEGRAM_CHAT_ID`   | Yes      | Telegram chat ID         | -       |
| `LOG_LEVEL`          | No       | Logging level            | `info`  |

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
pnpm test                    # Run tests
pnpm test --test-name-pattern "name"  # Run specific test
pnpm tsc --noEmit            # Type check
pnpm format                  # Format code
pnpm format:check            # Check formatting
```

## Project Structure

- `src/bun/main.ts` - Development entry point
- `src/worker/main.ts` - Production entry point
- `src/storage-interface.ts` - Abstract storage interface
- `src/storage-bun.ts` - SQLite implementation
- `src/storage-d1.ts` - D1 implementation
- `src/notifier-interface.ts` - Abstract notifier interface
- `src/telegram.ts` - Telegram notification implementation
- `src/*.test.ts` - Test files

## TODO

- [ ] Cap events table to prevent unlimited growth
- [ ] Add configurable retention period for events
- [ ] Implement cleanup job for old events
- [ ] Add metrics/monitoring for the service itself
- [ ] Support multiple Telegram chats per app
- [ ] Add machine cost estimation
- [ ] Implement alert rate limiting
- [ ] Add Telegram message formatting improvements
- [ ] Add inline buttons for quick actions (stop/restart machines)

## License

Private project.
