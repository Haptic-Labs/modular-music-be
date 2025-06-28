# Modular Music Backend

**⚠️ Alpha Release - This backend API is currently in alpha and under active development.**

The backend API for the Modular Music platform - a modular music automation system that allows users to create custom workflows for automated Spotify playlist generation. This Supabase-based backend provides Spotify integration, module execution, and scheduled automation capabilities.

## Architecture Overview

This backend is built on Supabase Edge Functions using Deno runtime and provides:

- **Spotify Integration**: OAuth authentication, token management, and comprehensive Spotify Web API access
- **Module Execution**: Run custom music automation workflows with various actions (filter, combine, shuffle, limit)
- **Scheduled Automation**: Automatic module execution based on user-defined schedules
- **Real-time Database**: PostgreSQL with custom schemas for modules, sources, actions, and caching
- **Edge Functions**: Serverless API endpoints deployed on Supabase Edge Runtime

## Features

### Spotify Integration

- OAuth authentication with Spotify
- Automatic token refresh and management
- Access to user playlists, recently played tracks, saved music, albums, and artists
- Playlist creation and modification
- Track data caching for performance

### Module System

- **Sources**: Pull music data from various Spotify sources
  - Playlists
  - Recently played tracks
  - Liked songs
  - Albums
  - Artists
- **Actions**: Process and transform music data
  - **Filter**: Remove tracks based on source criteria
  - **Combine**: Merge multiple sources together
  - **Shuffle**: Randomize track order
  - **Limit**: Restrict number of tracks (overall or per source)
- **Outputs**: Generate playlists in Spotify with configurable modes (replace, append, prepend)

### Automation & Scheduling

- Schedule modules to run automatically (daily, weekly, monthly, yearly)
- Cron job management for recurring executions
- Module execution tracking and status monitoring

## Prerequisites

Before setting up this backend, ensure you have:

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Deno](https://deno.land/) runtime (version 1.45.2 - required for Supabase Edge Functions compatibility)
- A Supabase account and project
- Spotify Developer credentials (Client ID and Client Secret)
- Node.js (for local development tools)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Spotify Integration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Error Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Haptic-Labs/modular-music-be.git
cd modular-music-be
```

### 2. Install Supabase CLI

Follow the [official installation guide](https://supabase.com/docs/guides/cli) for your operating system.

### 3. Initialize Supabase Locally

```bash
supabase start
```

This will:

- Start local Supabase services (PostgreSQL, API, Auth, Storage, etc.)
- Apply database migrations
- Seed the database with initial data
- Deploy Edge Functions locally

### 4. Configure Environment Variables

Copy your local Supabase credentials:

```bash
# Get your local Supabase URL and keys
supabase status
```

Update your `.env` file with the local development URLs and keys.

### 5. Deploy to Production (Optional)

To deploy to a production Supabase project:

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Deploy database migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy
```

## API Endpoints

### Spotify Functions (`/functions/v1/spotify`)

- `GET /playlists/:playlistId` - Get playlist details and tracks
- `GET /albums/:albumId/tracks` - Get tracks from an album
- `GET /artists/:artistId/tracks` - Get top tracks from an artist
- `GET /tracks/user` - Get user's saved tracks
- `POST /tracks/recently-listened` - Save user's recently played tracks
- `POST /auth/refresh-token` - Refresh Spotify access token
- `GET /auth/user-token` - Get user's current Spotify token

### Module Functions (`/functions/v1/modules`)

- `POST /:moduleId/run` - Execute a specific module
- `POST /:moduleId/schedule` - Schedule a module for automatic execution

## Database Schema

The backend uses multiple PostgreSQL schemas:

- **`public`**: Core application data (modules, sources, actions, outputs)
- **`spotify_auth`**: Spotify authentication and token storage
- **`spotify_cache`**: Cached Spotify API responses for performance
- **`feature_flags`**: Application feature toggles

### Key Tables

- `modules`: User-created automation workflows
- `module_sources`: Input sources for modules (playlists, tracks, etc.)
- `module_actions`: Processing actions (filter, combine, shuffle, limit)
- `module_outputs`: Output configurations (target playlists)
- Various action-specific tables for configurations

## Development

### Local Development

```bash
# Start Supabase services
supabase start

# Watch for changes and restart functions
supabase functions serve --env-file .env

# View logs
supabase functions logs
```

### Testing

```bash
# Run database tests
supabase test db

# Test Edge Functions locally
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/spotify' \
  --header 'Authorization: Bearer your-jwt-token' \
  --header 'Content-Type: application/json'
```

### Database Management

```bash
# Generate TypeScript types from database schema
supabase gen types typescript --local > supabase/functions/_shared/database.gen.ts

# Create new migration
supabase migration new migration_name

# Reset database (⚠️ Destructive)
supabase db reset
```

## Technology Stack

- **Runtime**: Deno 1.45.2
- **Database**: PostgreSQL 15 with Supabase extensions
- **Edge Functions**: Supabase Edge Runtime
- **HTTP Framework**: Hono v4
- **Spotify API**: @soundify/web-api
- **Authentication**: Supabase Auth with Spotify OAuth
- **Scheduling**: pg_cron for automated module execution
- **Error Monitoring**: Sentry (optional)

## Contributing

As this is an alpha release, contribution guidelines are still being developed. Please reach out to the development team if you're interested in contributing.

### Development Guidelines

1. Follow existing code patterns and TypeScript conventions
2. Add proper error handling and logging
3. Update database migrations when changing schema
4. Test Edge Functions locally before deploying
5. Document new API endpoints and features

## Related Repositories

- **Frontend**: [modular-music-fe](https://github.com/Haptic-Labs/modular-music-fe) - React frontend application

## Alpha Notice

This backend API is currently in alpha stage, which means:

- API endpoints may change without notice
- Database schema may evolve with breaking changes
- Some functionality may be incomplete or unstable
- Error handling and logging are still being improved
- Production deployment patterns are being refined

## Support

For questions, issues, or feature requests during the alpha phase, please contact the development team directly.

## License

See the [LICENSE](LICENSE) file for details.
