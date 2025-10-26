# Fly Machine Monitor

A Fly.io machine monitoring service that tracks billing-relevant events (start/stop/suspend) and sends alerts via Discord. Built with Bun for optimal performance.

## Features

- ✅ Monitors all Fly.io machines across all apps
- ✅ Detects billing-relevant state changes (started/stopped/suspended)
- ✅ Sends formatted alerts to Discord webhook
- ✅ Stores event history to prevent duplicate notifications
- ✅ Configurable check intervals
- ✅ SQLite database for persistent state storage

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Copy the example environment file and create your local configuration:

```bash
cp .env .env.local
```

Edit `.env.local` with your actual values:

```bash
# Fly.io API Configuration
FLY_API_TOKEN=your_fly_api_token_here
FLY_ORG_SLUG=your_fly_organization_slug
FLY_API_HOSTNAME=https://api.machines.dev

# Discord Integration
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here

# Application Configuration
LOG_LEVEL=info
```

### 3. Get Fly.io API Token

Generate a Fly.io API token with appropriate permissions:

```bash
fly tokens create readonly --name "fly-machine-monitor"
```

**Token Options:**

- `readonly`: Read-only access (recommended for monitoring)
- `--name`: Descriptive name for your token
- `--expiry`: Token expiration (e.g., `30d` for 30 days)

**Alternative token types:**

- `fly tokens deploy`: Full deployment permissions
- `fly tokens create`: Custom permissions with flags like `--machine`, `--app`, etc.

For monitoring purposes, `readonly` tokens are recommended as they provide read access to machine states without modification capabilities.

### 4. Set Up Discord Webhook

1. Create a Discord server or use existing one
2. Go to Server Settings → Integrations → Webhooks
3. Create new webhook and copy the URL
4. Add the webhook URL to your `.env.local` file

## Usage

### Running the Monitor

```bash
bun run index.ts
```

The monitor will:

1. Initialize the SQLite database
2. Fetch all your Fly.io apps and machines
3. Check for state changes
4. Send Discord alerts for billing-relevant changes
5. Repeat every 5 minutes

### Environment Variables

| Variable              | Required | Description                           | Default |
| --------------------- | -------- | ------------------------------------- | ------- |
| `FLY_API_TOKEN`       | ✅       | Fly.io API authentication token       | -       |
| `FLY_ORG_SLUG`        | ✅       | Fly.io organization slug              | -       |
| `DISCORD_WEBHOOK_URL` | ✅       | Discord webhook URL for alerts        | -       |
| `LOG_LEVEL`           | ❌       | Logging level (debug/info/warn/error) | `info`  |

## Monitored State Changes

The system monitors these billing-relevant transitions:

- `started` → `stopped` (machine stopped, potential cost savings)
- `stopped` → `started` (machine started, incurring costs)
- `started` → `suspended` (machine suspended, cost savings)
- `suspended` → `started` (machine resumed, incurring costs)
- `stopped` → `suspended` (machine suspended)
- `suspended` → `stopped` (machine stopped)

## Database Schema

The application uses SQLite with two tables:

### `machines` table

- `id`: Machine ID (primary key)
- `app_name`: Fly app name
- `name`: Machine name
- `last_state`: Last known state
- `last_updated`: Timestamp of last update
- `region`: Machine region
- `instance_id`: Current instance ID

### `events` table

- `id`: Event ID (primary key, auto-increment)
- `machine_id`: Associated machine ID
- `event_type`: Type of event
- `previous_state`: Previous machine state
- `new_state`: New machine state
- `timestamp`: Event timestamp
- `notified`: Whether Discord notification was sent

## Development

### Running Tests

```bash
bun test
```

### Type Checking

```bash
bun tsc --noEmit
```

## License

Private project - see project-specific licensing terms.
