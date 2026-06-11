# Morning Triage

A full-stack daily planning app for ADHD users built with Next.js, Supabase, and Claude AI.

## Overview

Morning Triage is an executive function engine that synthesizes a user's task dump, calendar, and context into a focused daily plan. It uses Claude Haiku for real-time parsing and Claude Sonnet for morning triage generation.

## Features

- **Dump Capture**: Capture anything on your mind without filtering
- **AI-Powered Parsing**: Haiku classifies items as tasks, replies needed, worries, ideas, or someday items
- **Morning Triage**: Sonnet generates a focused Big 3 plan based on your dump and calendar
- **Contextual Planning**: Considers calendar events, energy levels, and deferred items
- **User Authentication**: Secure sign-up and login with Supabase Auth
- **Persistent Storage**: All data stored in Supabase PostgreSQL

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Anthropic Claude (Haiku + Sonnet)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key

### Installation

1. Clone the repository
   ```bash
   git clone <repo-url>
   cd morningtriage
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.local.example .env.local
   ```

4. Add your credentials to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
   - `ANTHROPIC_API_KEY`: Your Anthropic API key

### Supabase Setup

1. Create a new Supabase project
2. Run the migration to create tables:
   ```bash
   # Copy the contents of supabase/migrations/001_initial_schema.sql
   # and run in Supabase SQL editor
   ```
3. Enable Row Level Security (RLS) on all tables (already done in migration)

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── dump-capture/page.tsx
│   │   └── morning-plan/page.tsx
│   ├── api/
│   │   ├── dump/route.ts
│   │   └── triage/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── useSupabase.ts
│   └── anthropic/
│       ├── parse.ts
│       └── triage.ts
└── types/
    └── index.ts
```

## Database Schema

### Users
- id (UUID, PK)
- email (unique)
- preferences (JSONB)
- created_at

### Dump Items
- id (UUID, PK)
- user_id (FK)
- raw_text
- type (enum: task, reply_needed, worry, idea, someday)
- times_deferred (tracks how many times deferred)
- user_priority_flag
- created_at
- deleted_at (soft delete)

### Morning Plans
- id (UUID, PK)
- user_id (FK)
- plan_date (unique per user per day)
- greeting (JSON text)
- big_3 (JSONB array of 3 tasks)
- avoided_thing (JSONB)
- deferred_count
- deferred_note
- energy_check (low | normal | null)
- created_at

## API Routes

### POST /api/dump
Creates a new dump item. Parses type with Haiku.

**Headers:**
- `x-user-id`: User ID

**Body:**
```json
{
  "raw_text": "string",
  "user_priority_flag": boolean
}
```

### GET /api/dump
Fetches all user's dump items.

**Headers:**
- `x-user-id`: User ID

### POST /api/triage
Generates morning plan. Calls Sonnet with context.

**Headers:**
- `x-user-id`: User ID

**Body:**
```json
{
  "user_check_in": "low" | "normal" | "none"
}
```

### GET /api/triage
Fetches today's cached morning plan.

**Headers:**
- `x-user-id`: User ID

## Claude System Prompt

The morning triage system prompt is embedded in `src/lib/anthropic/triage.ts`. Key features:

- **British English** voice (warm, dry, human)
- **Big 3 selection rules**: Hard deadlines, blocked tasks, user priorities, quick wins
- **Avoided Thing rules**: Oldest deferred items with zero guilt
- **Edge cases**: Empty dumps, overwhelming counts, low energy, conflicting deadlines

See `MORNINGSCREENTRIAGEPROMPT.md` for the full system prompt specification.

## Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Type Checking
TypeScript is configured in strict mode. The build will fail if there are type errors.

## Deployment

The app is ready for deployment to Vercel:

```bash
vercel deploy
```

Ensure environment variables are set in your Vercel project settings.

## Future Enhancements

- Calendar integration (Google Calendar, Outlook)
- Completion tracking for Big 3 items
- Daily email summaries
- Mobile app
- Focus mode with time blocking
- Analytics dashboard
- Settings for greeting preferences
- Rate limiting on API calls

## Notes

- All data is encrypted at rest on Supabase
- RLS policies ensure users can only access their own data
- Haiku parsing runs at capture time (~$0.0001 per call)
- Sonnet triage runs once per day (~$0.003 per call)
- Cost per user per month: ~$0.005 for AI calls

## License

Private use. Contact authors for licensing information.
