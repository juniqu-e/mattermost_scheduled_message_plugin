# Mattermost Scheduled Messages Plugin with GUI

A Mattermost plugin that extends scheduled message functionality with a graphical user interface. This plugin is forked from [mattermost-plugin-poor-mans-scheduled-messages](https://github.com/apartmentlines/mattermost-plugin-poor-mans-scheduled-messages) and adds GUI support for scheduling messages with file attachments through an API.

## Features

-   **GUI-based message scheduling**: Schedule messages through an intuitive graphical interface
-   **File attachment support**: Attach files to scheduled messages via API
-   **Command-line interface**: Traditional slash command support for quick scheduling
-   **Flexible time formats**: Support for various time and date formats
-   **Message management**: View, list, and delete scheduled messages

## Installation

### From Release

1. Download the latest plugin bundle (`com.mattermost-plugin-schedule-message-gui-X.X.X.tar.gz`) from the releases page
2. In Mattermost, go to **System Console > Plugin Management**
3. Upload the plugin bundle
4. Enable the plugin

### From Source

#### Prerequisites

-   Go 1.19 or higher
-   Node.js 16.x or higher
-   npm
-   GNU Make

#### Build Steps

```bash
# Clone the repository
git clone https://lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui.git
cd mattermost-plugin-schedule-message-gui

# Install dependencies and build
make dist

# The plugin bundle will be created at: dist/com.mattermost-plugin-schedule-message-gui-*.tar.gz
```

## Usage

### GUI Mode

1. Click the schedule button in the message composition area
2. Select the date and time for your message
3. Write your message and optionally attach files
4. Click "Schedule" to confirm

### Command Mode

The plugin supports traditional slash commands for quick scheduling:

#### Schedule a Message

```
/schedule at <time> [on <date>] message <your message text>
```

**Time Formats:**

-   12-hour: `9:00AM`, `3pm`, `2:15PM`
-   24-hour: `17:30`, `13:00`

**Date Formats:**

-   Full date: `2026-01-15` (YYYY-MM-DD)
-   Day of week: `mon`, `Monday`, `fri`
-   Short day of month: `3jan`, `26dec`
-   Omit date for same day/next occurrence

**Examples:**

```bash
# Schedule for today at 2:15 PM
/schedule at 2:15PM message Sales meeting now

# Schedule for Christmas morning
/schedule at 9am on 25dec message Merry Christmas!

# Schedule for next Friday afternoon
/schedule at 3pm on fri message Coffee break

# Schedule far in the future
/schedule at 13:00 on 2050-01-01 message End of the world
```

#### Manage Scheduled Messages

```bash
# List all scheduled messages
/schedule list

# Get help
/schedule help
```

To delete a scheduled message, use `/schedule list` and click the "Delete" button below the message you want to remove.

## API Endpoints

### Create Schedule

**Endpoint:** `POST /plugins/com.mattermost-plugin-schedule-message-gui/api/v1/schedule`

**Request Body:**

```json
{
    "channel_id": "channel_id_here",
    "file_ids": ["file_id_1", "file_id_2"],
    "post_at_time": "14:30",
    "post_at_date": "2024-12-25",
    "message": "Your message content"
}
```

**Response:** Returns the scheduled post details

### Get Scheduled Messages

**Endpoint:** `GET /plugins/com.mattermost-plugin-schedule-message-gui/api/v1/schedule`

Returns a list of all scheduled messages for the authenticated user.

### Delete Scheduled Message

**Endpoint:** `DELETE /plugins/com.mattermost-plugin-schedule-message-gui/api/v1/list`

**Request Body:**

```json
{
    "job_id": "job_id_here",
    "user_id": "user_id_here"
}
```

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development instructions.

### Quick Start

```bash
# Install dependencies
make install-go-tools
cd webapp && npm install && cd ..

# Run tests
make test

# Build the plugin
make dist

# Deploy to local Mattermost instance (requires local mode enabled)
make deploy
```

### Project Structure

```
.
├── server/              # Go backend
│   ├── api/            # API handlers
│   ├── command/        # Slash command handlers
│   ├── scheduler/      # Message scheduling logic
│   └── store/          # Data persistence
├── webapp/             # React frontend
│   └── src/
│       ├── features/   # Feature modules
│       │   └── schedule-message/  # Scheduling UI
│       └── entities/   # Domain entities
└── internal/           # Internal packages
    └── ports/          # Interface definitions
```

### Architecture

This plugin follows a **ports and adapters** architecture pattern:

-   Core business logic is independent of Mattermost API
-   All external dependencies are abstracted through interfaces in `internal/ports`
-   Production adapters in `adapters/mm`
-   Test doubles in `adapters/mock`

## Configuration

No additional configuration is required. The plugin works out of the box after installation and activation.

## Requirements

-   Mattermost Server 6.2.1 or higher
-   Plugin uploads must be enabled in System Console

## Support

-   Report issues: [Issue Tracker](https://lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/issues)
-   Original project: [mattermost-plugin-poor-mans-scheduled-messages](https://github.com/apartmentlines/mattermost-plugin-poor-mans-scheduled-messages)

## License

This project is forked from [apartmentlines/mattermost-plugin-poor-mans-scheduled-messages](https://github.com/apartmentlines/mattermost-plugin-poor-mans-scheduled-messages).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Check code style: `make check-style`
6. Submit a pull request
