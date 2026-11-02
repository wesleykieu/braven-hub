# Braven Hub

Events, alumni, jobs and AI career coaching for Braven Fellows + San José State students. **No login**: personal info lives in the visitor's browser (localStorage).

```bash
npm install
cp .env.example .env.local   # all keys optional
npm run dev                  # http://localhost:3200
```

## Pages
| Route | What |
|---|---|
| `/` | Hero, Braven photo carousel, feature bento, stats, upcoming events |
| `/events` | Filterable grid + map view of all events |
| `/events/[id]` | Details, agenda, live map + wayfinding, RSVP |
| `/alumni` | Search Braven Fellows / SJSU alumni / Leadership Coaches by career field; Connect with an AI-drafted intro |
| `/jobs` | Jobs ranked against your profile, with match reasons |
| `/coach` | AI resume review, mock interview (STAR grading), cover letter, elevator pitch |
| Floating "Ask Bravo" | AI assistant that knows the site and links you to pages |

## RSVP → calendar + texts
- Always: a prefilled **Add to Google Calendar** link + an `.ics` download.
- With `RESEND_API_KEY` + `INVITE_FROM_EMAIL`: emails a real calendar invite (METHOD:REQUEST). The UID stays the same per attendee, so if you change an event, bump its `sequence` in `src/data/events.ts` and call `POST /api/admin/notify-update` (header `x-admin-token`). Google Calendar then updates the existing entry.
- With Twilio (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`): a confirmation text right away, plus reminders 24h and 2h before, scheduled with Twilio `SendAt` (no cron needed).
- With no keys set it runs in **demo mode**: messages are logged to the server console and the UI shows "Demo mode".

## AI
Model-agnostic (`src/lib/ai/provider.ts`). Set `AI_PROVIDER=openai-compatible` + `AI_BASE_URL`/`AI_API_KEY`/`AI_MODEL` to use any OpenAI-compatible endpoint. With no provider set, a built-in rule-based coach (`src/lib/ai/demo.ts`) answers instead.

## Data
`src/data/*`: events, alumni and jobs are **sample data**, and the alumni are fictional people. Photos in `public/photos` come from braven.org. RSVPs and connect requests are written to `.data/` (local only). Use a real DB before deploying.

## Demo video
Fast (~55s), TikTok-style product demo: Playwright drives the real app, a neural voice narrates (edge-tts), and captions pop in word-by-word in sync with the voice.
```bash
python3 -m venv scripts/demo-video/.venv && scripts/demo-video/.venv/bin/pip install edge-tts   # once
npm run build && npx next start -p 3201 &
npm run demo:video        # → demo/braven-hub-demo.mp4 (+ -silent.mp4)
```
Script lines and scenes live in `scripts/demo-video/record.mjs`. Env: `DEMO_VOICE` (default `en-US-AvaMultilingualNeural`; try `en-US-AndrewMultilingualNeural`, `en-US-EmmaMultilingualNeural`, `en-US-JennyNeural`), `DEMO_RATE` (default `+12%`), `DEMO_PITCH`.
