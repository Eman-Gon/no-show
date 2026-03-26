---
name: noshow-ai
description: >
  NoShow.ai — outbound voice agent that calls patients who missed appointments,
  reschedules them via Vapi AI + Cartesia Sonic 3, and logs outcomes to a
  Next.js dashboard. Use this skill when working on any part of the NoShow
  project: call flow, webhook handler, dashboard UI, mock data, Vapi config,
  or demo flow.
---

# NoShow.ai Project Skill

## Stack

- **Next.js 14 (App Router)** — full-stack: dashboard frontend + API routes for webhooks
- **Vapi AI** — outbound call orchestration (REST API)
- **Cartesia Sonic 3** — TTS voice provider configured through Vapi
- **TypeScript** — entire codebase
- **Tailwind CSS** — styling
- **Mock data** — hardcoded patients + appointments (no DB for MVP)

## Project Structure

```
no-show/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard UI
│   │   ├── layout.tsx            # Root layout
│   │   └── api/
│   │       ├── vapi/
│   │       │   └── webhook/route.ts   # Vapi webhook handler
│   │       ├── call/
│   │       │   └── route.ts           # Trigger outbound call
│   │       └── appointments/
│   │           └── route.ts           # Get/update appointments
│   ├── lib/
│   │   ├── mock-data.ts          # Patient + appointment mock data
│   │   ├── vapi.ts               # Vapi API client helpers
│   │   └── types.ts              # Shared TypeScript types
│   └── components/
│       ├── dashboard-table.tsx   # Patient table component
│       ├── status-badge.tsx      # Status badge component
│       └── trigger-call-btn.tsx  # "Trigger Demo Call" button
├── .env.local                    # VAPI_API_KEY, VAPI_PHONE_NUMBER_ID, etc.
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Core Flow

1. Patient misses appointment → row appears in dashboard as "Pending"
2. User clicks "Trigger Demo Call" or API fires automatically
3. POST `/api/call` → creates Vapi outbound call with assistant config
4. Vapi calls patient, runs voice script (intro → offer slots → confirm)
5. Vapi sends webhook events to POST `/api/vapi/webhook`
6. Webhook handler updates in-memory appointment status
7. Dashboard polls `/api/appointments` and reflects real-time status

## Voice Agent Script

- **Intro**: "Hi, this is Maya calling from [Clinic Name]..."
- **Offer slots**: Provide 2-3 hardcoded available slots
- **Confirm**: Confirm selected slot, end call
- **No answer**: Log as "no answer"

## Key Environment Variables

```
VAPI_API_KEY=           # Vapi dashboard → API Keys
VAPI_PHONE_NUMBER_ID=   # Vapi dashboard → Phone Numbers
NEXT_PUBLIC_BASE_URL=   # For webhooks (use ngrok in dev)
```

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
```

## Conventions

- All API routes return JSON with consistent shape: `{ success: boolean, data?: T, error?: string }`
- Mock data is stored in-memory (resets on server restart)
- Status enum: "pending" | "rescheduled" | "no-answer" | "declined"
- Use server-side API routes for all Vapi interactions (keep API key server-only)
