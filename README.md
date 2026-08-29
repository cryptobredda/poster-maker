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
# Optional alternative when a deployment UI changes multiline values:
GOOGLE_PRIVATE_KEY_BASE64=<base64-encoded-private-key>
CRON_SECRET=<a-secret-string-for-secured-endpoints>
CORS_ALLOWED_ORIGIN=https://www.example.org
```

`GOOGLE_PRIVATE_KEY` accepts a PEM value with real line breaks or escaped `\n` sequences. `GOOGLE_PRIVATE_KEY_BASE64` is an optional alternative and takes precedence when set. `CORS_ALLOWED_ORIGIN` is optional. When set, `/prayer-times`, `/poster`, `/table-svg`, and `/health` emit CORS headers only when the request `Origin` exactly matches this value. `CRON_SECRET` is required for cron endpoints; if it is unset, every `/cron/*` request fails closed with HTTP 503.

### Install & Run

```bash
npm install
npm run dev          # local dev (tsx, hot reload)
npm run build        # compile + copy assets to dist/
node dist/index.js   # production start
```

The server starts at `http://localhost:3000` by default (override with the `PORT` env var). If that port is already in use, it automatically tries the next available port and logs the URL it selected.

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

### `GET /prayer-times?date=YYYY-MM-DD`

Returns the Google Sheet row for one London calendar date as normalized JSON. If the requested month does not exist, it is generated from the Aladhan API and written to Google Sheets before the response is served. If `date` is omitted, the current date in `Europe/London` is used. Existing Sheet start and jamaah values are preserved exactly; only a blank Maghrib start is calculated from Aladhan using the Sheet configuration. Jumu’ah is the first nonblank maintained Dhuhr jamaah value from a Friday in the same month.

```bash
curl "localhost:3000/prayer-times?date=2026-07-25"
```

Response:

```json
{
  "date": "2026-07-25",
  "dateLabel": "Saturday 25 July 2026",
  "timezone": "Europe/London",
  "source": "maintained-sheet",
  "month": "July 2026",
  "prayers": {
    "fajr": { "start": "3:12", "jamaah": "4:00" },
    "sunrise": { "start": "5:16" },
    "dhuhr": { "start": "1:14", "jamaah": "1:30" },
    "asr": { "start": "5:31", "jamaah": "6:15" },
    "maghrib": { "start": "9:07", "jamaah": "9:08", "startSource": "calculated" },
    "isha": { "start": null, "jamaah": "10:30" }
  },
  "jumuah": { "jamaah": "1:30" }
}
```

Blank maintained values are returned as `null`. `prayers.maghrib.startSource` is `sheet` when the maintained row supplied the start and `calculated` only when the fallback supplied it. `jumuah.jamaah` remains in the Sheet’s original time format and is `null` when no Friday Dhuhr jamaah is maintained. Errors use a structured body:

```json
{
  "error": {
    "code": "PRAYER_TIMES_NOT_FOUND",
    "message": "No maintained prayer times were found for 2026-07-25.",
    "details": { "date": "2026-07-25" }
  }
}
```

Possible error codes include `INVALID_DATE` (400), `PRAYER_TIMES_NOT_FOUND` (404), `MONTH_GENERATION_FAILED` (502), `MAGHRIB_CALCULATION_FAILED` (502), and `INTERNAL_ERROR` (500).

---

### `GET /poster`

Generate the prayer timetable poster as PNG. Without query parameters, the current month is determined in `Europe/London`. If a requested month tab does not exist, it is generated from the Aladhan API and written to Google Sheets before the poster is served. Existing tabs are never overwritten by this public endpoint. Poster buffers are cached independently by `year-month` for 30 minutes.

`month` and `year` must either both be omitted or both be present. Month is `1`-`12` and year must be between `1900` and `2199`.

```bash
# Current London month (cached for 30 min)
curl -o poster.png localhost:3000/poster

# A specific month
curl -o poster.png "localhost:3000/poster?month=7&year=2026"

# Bypass all caching and return Cache-Control: no-store
curl -o poster.png "localhost:3000/poster?month=7&year=2026&nocache=1"

# Force a browser download with prayer-times-2026-07.png
curl -OJ "localhost:3000/poster?month=7&year=2026&download=1"
```

Response: `image/png`. `download=1` changes `Content-Disposition` to `attachment`; other responses use `inline`.

---

### `GET /poster?nocache=1`

Same as above but skips the in-memory cache, regenerates, and returns `Cache-Control: no-store`. The legacy `no-cache=1` spelling is also supported.

```bash
curl -o poster.png "localhost:3000/poster?nocache=1"
```

---

### `GET /table-svg`

Returns the SVG source of the prayer table (without the background template). Useful for debugging or embedding. It accepts the same strict, paired `month` and `year` parameters as `/poster`; missing month tabs are generated before the response is served.

```bash
curl -o table.svg localhost:3000/table-svg
curl -o table.svg "localhost:3000/table-svg?month=7&year=2026"
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

All endpoints below require either `?secret=` or an `X-Cron-Secret` header matching `CRON_SECRET`. Authentication is centralized for every `/cron/*` route. If `CRON_SECRET` is unset, these endpoints return HTTP 503 rather than accepting an empty secret.

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

### `POST /cron/fix-dhuhr`

Updates only the Dhuhr Jamat column in every existing month tab. This endpoint is authenticated because it changes existing Google Sheet data. It sets Dhuhr Jamat to `1:25` during UK BST and `12:25` during UK GMT without regenerating the other prayer times.

```bash
curl -X POST "localhost:3000/cron/fix-dhuhr?secret=zawia"
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

Dhuhr Jamat is fixed at `1:25` during UK BST and `12:25` during UK GMT. It does not follow the calculated Dhuhr start time.

### How To Tab

Created automatically. Contains usage instructions.

### Config Tab

Created automatically. Controls poster behaviour:

| Setting | Default |
|---------|---------|
| showMaghribStart | FALSE |
| showIshaStart | FALSE |
| calculationMethod | 15 |
| school | 0 |
| fajrOffset | 0 |
| sunriseOffset | 0 |
| dhuhrOffset | 0 |
| asrOffset | 0 |
| maghribOffset | 0 |
| ishaOffset | 0 |

When the display settings are `TRUE`, the poster shows START columns for Maghrib and Isha. Offsets are minutes. The correctly spelled `dhuhrOffset` is preferred; the legacy `dhirOffset` key remains supported when `dhuhrOffset` is absent.

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

Old tabs are never deleted — they accumulate as a historical record. The app first looks for the current `Europe/London` month, then falls back to the latest valid month tab using chronological year/month ordering (not alphabetical tab-name ordering).

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
