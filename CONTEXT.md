# NoShow.ai — Session Context

## What this is
Outbound voice AI that calls patients who missed appointments, reschedules them, and logs outcomes to a Next.js dashboard. Built for demo purposes.

**Stack:** Next.js 16 (App Router) · Vapi AI · Bland AI (fallback) · Cartesia Sonic 3 · Plivo SMS · TypeScript · Tailwind

---

## Current state

- Dev server runs on `http://localhost:3000` via `npm run dev`
- All data is in-memory mock data — resets on server restart (intentional for demos)
- Polling: dashboard hits `/api/appointments` every 3 seconds for live status updates

---

## Credentials & IDs

| Key | Value |
|-----|-------|
| Vapi org ID | `277c0b67-3395-4189-9dd6-f4c1c1adec81` |
| Vapi phone number ID | `7868d153-f488-4798-b67c-42818e5756ca` |
| Vapi outbound number | `+16055308336` |
| Vapi private key | in `.env.local` |
| Bland API key | in `.env.local` (add yours) |

---

## Call provider setup

Vapi is primary. Bland is automatic fallback — if Vapi throws any error (rate limit, carrier block, etc.), the call route silently retries via Bland. No manual intervention needed.

**Vapi outbound limit history:** org was carrier-blocked once, Vapi team manually unblocked it. If calls stop working, email Vapi support with the org ID above.

To trigger a call manually:
```bash
curl -X POST http://localhost:3000/api/call \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "apt2"}'
```

`apt2` = David Kim, maps to `+14154006707` in mock data.

---

## Key files

| File | Purpose |
|------|---------|
| `src/lib/vapi.ts` | Vapi API client — builds assistant config + fires call |
| `src/lib/bland.ts` | Bland AI fallback client |
| `src/lib/mock-data.ts` | All patient/appointment data + available slots |
| `src/app/api/call/route.ts` | POST — triggers outbound call (Vapi → Bland fallback) |
| `src/app/api/vapi/webhook/route.ts` | Receives Vapi status events, updates appointment state |
| `src/app/api/appointments/route.ts` | GET — returns appointments joined with patient data |
| `src/app/page.tsx` | Dashboard page |
| `src/components/dashboard-shell.tsx` | Client wrapper — owns polling state |
| `src/components/dashboard-table.tsx` | Appointments table |
| `src/components/stats-cards.tsx` | 4 metric cards at top |
| `src/components/trigger-call-btn.tsx` | "Call Now" button with phone override input |
| `src/components/status-badge.tsx` | Status pill component |

---

## Demo flow

1. `npm run dev`
2. Open `http://localhost:3000`
3. Click "Call Now" on any pending row (or use curl above)
4. Enter phone override if you want it to ring a real number instead of mock data
5. Row status updates live as Vapi webhooks come in
6. To reset: restart the dev server (clears in-memory state)

---

## Known issues / gotchas

- **Webhook only works in production or with ngrok** — `NEXT_PUBLIC_BASE_URL=http://localhost:3000` means Vapi can't reach the webhook locally. Status won't auto-update unless you expose the server via ngrok and update `.env.local`.
- **Bland API key not set yet** — add it to `.env.local` before relying on the fallback
- **No database** — all state is in-memory. Server restart = full reset. Intentional for MVP/demo.
- **Vapi voice:** Cartesia "British Lady" voice ID `a0e99841-438c-4a64-b679-ae501e7d6091`
