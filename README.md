# Prayer Poster

Generates a PNG poster from prayer times stored in a Google Sheet.

## Setup

### Requirements

- Node.js 20+
- A Google Cloud service account with Sheets API access
- A Google Sheet with tabs named by month (e.g. `May 2026`)

### Environment Variables

Create a `.env` file:

```env
GOOGLE_SHEET_ID=<your-google-sheet-id>
GOOGLE_CLIENT_EMAIL=<your-service-account-email>
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
CRON_SECRET=<a-secret-string-for-secured-endpoints>
```

### Install & Run

```bash
npm install
npm run dev          # local dev (tsx, hot reload)
npm run build        # compile + copy assets to dist/
node dist/index.js   # production start
```

The server listens on `http://localhost:3000` by default (override with `PORT` env var).

---

## API Endpoints

### `GET /health`

Health check.

```bash
curl localhost:3000/health
```

Response:
```json
{ "status": "ok", "time": "2026-05-09T00:00:00.000Z" }
```

---

### `GET /poster`

Generate the prayer timetable poster as PNG. Reads data from the current month's sheet tab.

```bash
# Normal (cached for 30 min)
curl -o poster.png localhost:3000/poster

# Bypass cache
curl -o poster.png "localhost:3000/poster?nocache=1"
```

Response: `image/png`

---

### `GET /poster?nocache=1`

Same as above but skips the in-memory cache and regenerates.

```bash
curl -o poster.png "localhost:3000/poster?nocache=1"
```

---

### `GET /table-svg`

Returns the SVG source of the prayer table (without the background template). Useful for debugging or embedding.

```bash
curl -o table.svg localhost:3000/table-svg
```

Response: `image/svg+xml`

---

### `GET /template-preview`

Generates a preview of just the background template with sample data.

```bash
curl -o template-preview.png localhost:3000/template-preview
```

Response: `image/png`

---

## Cron & Management Endpoints

All endpoints below require `?secret=` matching your `CRON_SECRET` env var.

### `GET /cron/sync` / `POST /cron/sync`

Creates the current month and next month sheet tabs if they don't already exist. Data is fetched from the Aladhan API.

```bash
curl "localhost:3000/cron/sync?secret=zawia"
curl -X POST "localhost:3000/cron/sync?secret=zawia"
```

Response:
```
Synced. Created tabs: May 2026, June 2026
```

---

### `POST /cron/rewrite`

Rewrites all existing month tabs with the current 12-column format. **Preserves user edits** (reads existing data then writes it back).

```bash
# Rewrite all month tabs
curl -X POST "localhost:3000/cron/rewrite?secret=zawia"

# Rewrite a specific range (alphabetical by tab name)
curl -X POST "localhost:3000/cron/rewrite?secret=zawia&start=May%202026&end=June%202026"
```

Response:
```
Rewrote tabs: May 2026, June 2026
```

---

### `POST /cron/regenerate`

**Destructive.** Deletes and recreates a specific tab from the Aladhan API. All manual edits and formatting in that tab will be lost.

```bash
curl -X POST "localhost:3000/cron/regenerate?secret=zawia&tab=May%202026"
```

Response:
```
Regenerated May 2026
```

---

## Google Sheet Structure

### Month Tabs

Each month tab (e.g. `May 2026`) uses a **two-row header** with exactly **12 columns**:

| Col | Header 1 | Header 2 | Content |
|-----|----------|----------|---------|
| A   | MAY      | DATE     | Day number (1, 2, 3...) |
| B   |          | DAY      | Day name (MON, TUE...) |
| C   |          | (Islamic month) | Hijri day or month name |
| D   | FAJR     | START    | Fajr start time |
| E   |          | JAMAT    | Fajr jamat time |
| F   |          | SUNRISE  | Sunrise time |
| G   | DHUHR    | START    | Dhuhr start time |
| H   |          | JAMAT    | Dhuhr jamat time |
| I   | ASR      | START    | Asr start time |
| J   |          | JAMAT    | Asr jamat time |
| K   | MAGHRIB  | JAMAT    | Maghrib jamat time |
| L   | ISHA     | JAMAT    | Isha jamat time |

### How To Tab

Created automatically. Contains usage instructions.

### Config Tab

Created automatically. Controls poster behaviour:

| Setting | Value |
|---------|-------|
| showMaghribStart | FALSE |
| showIshaStart | FALSE |

When set to `TRUE`, the poster shows START columns for Maghrib and Isha (adding 2 more columns).

### Cell Merges & Formatting

The poster respects:
- **Merged cells**: vertical/horizontal merges are rendered in the poster
- **Background colors**: cell background colours are reflected
- **Text colors**: foreground colour is used for text
- **Bold text**: rendered as bold in the poster
- **Vertical text**: tall narrow merges are automatically rotated

---

## Sheet Tab Naming Convention

Tab names use the format produced by:
```javascript
new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
// Example: "May 2026", "June 2026"
```

Old tabs are never deleted — they accumulate as a historical record. The app reads from the latest month tab.

---

## Deployment

### Fly.io (recommended)

```bash
fly launch
fly deploy
```

### Render

1. Connect your GitHub repo in Render dashboard
2. Set **Root Directory** to `/` (default)
3. Add the env vars from `.env` in Render's dashboard
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `node dist/index.js`

### Manual (VPS with PM2)

```bash
npm install -g pm2
git clone <repo>
cd poster-maker
cp .env .env
npm install
npm run build
pm2 start dist/index.js --name poster-maker
pm2 save
pm2 startup
```
