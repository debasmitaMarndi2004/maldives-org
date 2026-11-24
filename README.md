# Maldives.org

Maldives travel discovery and trip planning with an editorial accommodation directory, activity guides, island transfers and sample trip ideas.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The app runs without supplier, payment, database or email credentials. See [local setup](docs/BEGINNER-SETUP.md) for verification steps.

## Current features

- The stay directory supports searching, filtering and comparison. Reviewed property pages cite official sources, and legacy sample listings remain labeled.
- The tours and activities directory provides editorial guides. The flights, transfers and trip-planning pages help visitors prepare an itinerary.
- The contact, newsletter and booking-request endpoints validate test submissions in preview mode. Live search, reservations, payment and email delivery are unavailable.
- The currency selector uses labeled estimates and saves the chosen display currency in the browser.

See the [API readiness plan](docs/API-READINESS.md) for the contracts and booking requirements.
