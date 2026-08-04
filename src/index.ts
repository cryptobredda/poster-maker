import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import { fetchMaghribStartForDate } from './api.js';
import { generatePoster, generateTemplatePreview } from './poster.js';
import { getCurrentMonthData, getSheetTabs, ensureHowToTab, ensureConfigTab, readTabColors, readConfig, rewriteTab, readTabGrid, getTabData, monthTabName, parseMonthYearFromTab, sortMonthTabsChronologically } from './sheets.js';
import { syncMonthlyTabs, regenerateAllTabs } from './cron.js';
import { buildTitle, getJumuahTime, getLondonDateParts } from './utils.js';
import { fillMissingMaghribStart, HttpError, normalizePrayerTime, parseMonthYear, parsePrayerDate, posterCacheKey, posterFilename } from './service.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const PUBLIC_CORS_PATHS = new Set(['/prayer-times', '/poster', '/table-svg', '/health']);

function sendStructuredError(res: Response, error: unknown): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'The request could not be completed.',
    },
  });
}

app.use((req, res, next) => {
  if (!PUBLIC_CORS_PATHS.has(req.path)) {
    next();
    return;
  }

  const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN?.trim();
  const requestOrigin = req.headers.origin;
  res.vary('Origin');
  if (allowedOrigin && requestOrigin === allowedOrigin) {
    res.set({
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
  }

  if (req.method === 'OPTIONS') {
    if (requestOrigin && allowedOrigin && requestOrigin !== allowedOrigin) {
      res.status(403).json({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin is not allowed.' } });
      return;
    }
    res.sendStatus(204);
    return;
  }

  next();
});

interface CacheEntry {
  data: Buffer;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000;

function getCached(key: string): Buffer | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCached(key: string, data: Buffer): void {
  cache.set(key, { data, ts: Date.now() });
}

interface KnownConfig {
  showMaghribStart: boolean;
  showIshaStart: boolean;
  calculationMethod: number;
  school: number;
  timeOffsets: {
    fajr: number; sunrise: number; dhuhr: number; asr: number; maghrib: number; isha: number;
  };
}

let knownConfig: KnownConfig | null = null;
let isRegenerating = false;

function configToKnown(config: import('./sheets.js').SheetConfig): KnownConfig {
  return {
    showMaghribStart: config.showMaghribStart,
    showIshaStart: config.showIshaStart,
    calculationMethod: config.calculationMethod,
    school: config.school,
    timeOffsets: { ...config.timeOffsets },
  };
}

function configChanged(current: KnownConfig, known: KnownConfig): boolean {
  return (
    current.showMaghribStart !== known.showMaghribStart ||
    current.showIshaStart !== known.showIshaStart ||
    current.calculationMethod !== known.calculationMethod ||
    current.school !== known.school ||
    current.timeOffsets.fajr !== known.timeOffsets.fajr ||
    current.timeOffsets.sunrise !== known.timeOffsets.sunrise ||
    current.timeOffsets.dhuhr !== known.timeOffsets.dhuhr ||
    current.timeOffsets.asr !== known.timeOffsets.asr ||
    current.timeOffsets.maghrib !== known.timeOffsets.maghrib ||
    current.timeOffsets.isha !== known.timeOffsets.isha
  );
}

async function getSelectedMonth(
  req: Request,
  config: import('./sheets.js').SheetConfig,
): Promise<{ times: import('./api.js').PrayerTime[]; tabName: string; year: number; month: number }> {
  const explicitSelection = req.query.month !== undefined || req.query.year !== undefined;
  const selection = parseMonthYear(req.query.month, req.query.year);

  if (explicitSelection) {
    const targetDate = new Date(selection.year, selection.month - 1, 1);
    const tabName = monthTabName(targetDate);
    try {
      return {
        times: await getTabData(tabName, config),
        tabName,
        ...selection,
      };
    } catch (error) {
      if (error instanceof Error && error.message === `Tab "${tabName}" not found`) {
        throw new HttpError(404, 'MONTH_NOT_FOUND', `No maintained prayer timetable was found for ${tabName}.`);
      }
      throw error;
    }
  }

  const data = await getCurrentMonthData(config);
  const selectedTab = parseMonthYearFromTab(data.tabName);
  return {
    times: data.times,
    tabName: data.tabName,
    year: selectedTab.year,
    month: selectedTab.month,
  };
}

async function checkConfigChange(config: import('./sheets.js').SheetConfig): Promise<void> {
  if (isRegenerating) return;
  const current = configToKnown(config);
  if (!knownConfig) {
    knownConfig = current;
    return;
  }
  if (!configChanged(current, knownConfig)) return;

  isRegenerating = true;
  try {
    const regenerated = await regenerateAllTabs();
    knownConfig = current;
    cache.clear();
    console.log(`Config change detected: regenerated ${regenerated.length} tabs`);
  } catch (err) {
    console.error('Error during config-change regeneration:', err);
  } finally {
    isRegenerating = false;
  }
}

// Seed knownConfig on startup so the first request doesn't falsely trigger regeneration
async function seedKnownConfig(): Promise<void> {
  try {
    const { readConfig } = await import('./sheets.js');
    knownConfig = configToKnown(await readConfig());
  } catch {}
}

app.get('/prayer-times', async (req, res) => {
  try {
    const date = parsePrayerDate(req.query.date);
    const config = await readConfig();
    const [year, month, day] = date.split('-').map(Number);
    const tabName = monthTabName(new Date(year, month - 1, 1));
    let monthTimes: import('./api.js').PrayerTime[];
    try {
      monthTimes = await getTabData(tabName, config);
    } catch (error) {
      if (error instanceof Error && error.message === `Tab "${tabName}" not found`) {
        throw new HttpError(404, 'PRAYER_TIMES_NOT_FOUND', `No maintained prayer times were found for ${date}.`, { date });
      }
      throw error;
    }

    const sheetDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    const maintainedTime = monthTimes.find(time => time.date === sheetDate);
    if (!maintainedTime) {
      throw new HttpError(404, 'PRAYER_TIMES_NOT_FOUND', `No maintained prayer times were found for ${date}.`, { date });
    }

    const maghribStartSource = maintainedTime.maghribStart.trim() ? 'sheet' : 'calculated';
    const prayerTime = await fillMissingMaghribStart(maintainedTime, async () => {
      try {
        return await fetchMaghribStartForDate(date, {
          calculationMethod: config.calculationMethod,
          school: config.school,
          timeOffsets: { ...config.timeOffsets },
        });
      } catch {
        throw new HttpError(502, 'MAGHRIB_CALCULATION_FAILED', 'The missing Maghrib start time could not be calculated.', { date });
      }
    });

    res.set('Cache-Control', 'no-store').json(normalizePrayerTime(prayerTime, {
      isoDate: date,
      monthTimes,
      maghribStartSource,
    }));
  } catch (error) {
    console.error('Error reading prayer times:', error instanceof HttpError ? error.code : error);
    sendStructuredError(res, error);
  }
});

app.get('/poster', async (req, res) => {
  const skipCache = req.query.nocache === '1' || req.query['no-cache'] === '1';

  try {
    const requestedMonth = parseMonthYear(req.query.month, req.query.year);
    const cacheKey = posterCacheKey(requestedMonth.year, requestedMonth.month);
    const filename = posterFilename(requestedMonth.year, requestedMonth.month);
    const responseHeaders = {
      'Content-Type': 'image/png',
      'Cache-Control': skipCache ? 'no-store' : 'public, max-age=1800',
      'Content-Disposition': req.query.download === '1'
        ? `attachment; filename="${filename}"`
        : `inline; filename="${filename}"`,
    };
    if (skipCache) res.set('Cache-Control', 'no-store');

    if (!skipCache) {
      const cached = getCached(cacheKey);
      if (cached) {
        res.set(responseHeaders).send(cached);
        return;
      }
    }

    const config = await readConfig();
    await checkConfigChange(config);
    const { times, tabName, year, month } = await getSelectedMonth(req, config);
    const targetDate = new Date(year, month - 1, 1);
    const colors = await readTabColors(tabName, config);
    const grid = await readTabGrid(tabName, config);
    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'short', timeZone: 'Europe/London' }).toUpperCase();
    const title = buildTitle(monthLabel, year, times);
    const jumuahTime = getJumuahTime(times);

    const result = await generatePoster(times, year, monthLabel, title, jumuahTime, colors, config, grid);
    const buf = Buffer.from(result.data);

    if (!skipCache) setCached(cacheKey, buf);
    res.set(responseHeaders).send(buf);
  } catch (error) {
    console.error('Error generating poster:', error instanceof HttpError ? error.code : error);
    sendStructuredError(res, error);
  }
});

app.get('/template-preview', async (_req, res) => {
  try {
    const result = await generateTemplatePreview();
    const buf = Buffer.from(result.data);
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': 'inline; filename="prayer-template-preview.png"',
    });
    res.send(buf);
  } catch (error) {
    console.error('Error generating template preview:', error);
    res.status(500).type('text').send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

app.get('/table-svg', async (req, res) => {
  try {
    parseMonthYear(req.query.month, req.query.year);
    const config = await readConfig();
    const { times, tabName, year, month } = await getSelectedMonth(req, config);
    const targetDate = new Date(year, month - 1, 1);
    const colors = await readTabColors(tabName, config);
    const grid = await readTabGrid(tabName, config);
    const { buildTableSvg } = await import('./poster.js');
    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'short', timeZone: 'Europe/London' }).toUpperCase();
    const svg = await buildTableSvg(times, monthLabel, colors, config, grid);
    res.set({ 'Content-Type': 'image/svg+xml' });
    res.send(svg);
  } catch (error) {
    console.error('Error generating table SVG:', error instanceof HttpError ? error.code : error);
    sendStructuredError(res, error);
  }
});

function requireCronSecret(req: Request, res: Response, next: NextFunction): void {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) {
    res.status(503).json({ error: { code: 'CRON_SECRET_NOT_CONFIGURED', message: 'Cron endpoints are unavailable.' } });
    return;
  }

  const querySecret = typeof req.query.secret === 'string' ? req.query.secret : undefined;
  const headerSecret = typeof req.headers['x-cron-secret'] === 'string' ? req.headers['x-cron-secret'] : undefined;
  if (querySecret !== configuredSecret && headerSecret !== configuredSecret) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized.' } });
    return;
  }

  next();
}

app.use('/cron', requireCronSecret);

app.get('/cron/sync', async (_req, res) => {
  try {
    const result = await syncMonthlyTabs();
    res.type('text').send(`Synced. Created tabs: ${result.created.join(', ') || 'none'}`);
  } catch (error) {
    console.error('Error in cron sync:', error);
    res.status(500).type('text').send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

app.post('/cron/sync', async (_req, res) => {
  try {
    const result = await syncMonthlyTabs();
    res.type('text').send(`Synced. Created tabs: ${result.created.join(', ') || 'none'}`);
  } catch (error) {
    console.error('Error in cron sync:', error);
    res.status(500).type('text').send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

app.post('/cron/rewrite', async (req, res) => {
  try {
    const config = await readConfig();
    const tabs = await getSheetTabs();
    const startFilter = (req.query.start as string) || '';
    const endFilter = (req.query.end as string) || '';

    const monthTabs = sortMonthTabsChronologically(tabs);
    const startIndex = startFilter ? monthTabs.indexOf(startFilter) : 0;
    const endIndex = endFilter ? monthTabs.indexOf(endFilter) : monthTabs.length - 1;
    if ((startFilter && startIndex < 0) || (endFilter && endIndex < 0) || startIndex > endIndex) {
      res.status(400).type('text').send('Invalid chronological start/end tab range');
      return;
    }

    const rewritten: string[] = [];
    for (const tab of monthTabs.slice(startIndex, endIndex + 1)) {
      await rewriteTab(tab, config);
      rewritten.push(tab);
    }
    res.type('text').send(`Rewrote tabs: ${rewritten.join(', ') || 'none'}`);
  } catch (error) {
    console.error('Error in rewrite:', error);
    res.status(500).type('text').send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

app.post('/cron/regenerate', async (req, res) => {
  const tabName = (req.query.tab as string) || '';
  if (!tabName) {
    res.status(400).type('text').send('Missing ?tab= parameter (e.g. ?tab=May%202026)');
    return;
  }

  try {
    const result = await import('./cron.js').then(m => m.regenerateTab(tabName));
    res.type('text').send(`Regenerated ${tabName}${result ? '' : ' (no data found)'}`);
  } catch (error) {
    console.error('Error in regenerate:', error);
    res.status(500).type('text').send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function start() {
  try {
    await ensureHowToTab();
    console.log('How To tab ready');
  } catch (err) {
    console.warn('Could not ensure How To tab:', err);
  }

  try {
    await ensureConfigTab();
    console.log('Config tab ready');
  } catch (err) {
    console.warn('Could not ensure Config tab:', err);
  }

  // NOTE: Disabled automatic startup rewrite to preserve user merges/formatting
  // Users can manually trigger rewrite via POST /cron/rewrite if needed

  try {
    const result = await syncMonthlyTabs();
    if (result.created.length > 0) {
      console.log('Created tabs on startup:', result.created.join(', '));
    }
  } catch (err) {
    console.warn('Startup tab sync skipped:', err);
  }

  // Seed known config so first check doesn't false-trigger
  await seedKnownConfig();

  // Check for config changes and regenerate tabs if needed
  setInterval(async () => {
    try {
      const config = await readConfig();
      await checkConfigChange(config);
    } catch (err) {
      console.error('Auto-config-check error:', err);
    }

    const now = getLondonDateParts();
    if (now.day >= 25) {
      try {
        const result = await syncMonthlyTabs();
        if (result.created.length > 0) {
          console.log('Auto-created tabs:', result.created.join(', '));
        }
      } catch (err) {
        console.error('Auto-sync error:', err);
      }
    }
  }, 6 * 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app };

if (process.env.NODE_ENV !== 'test') {
  start();
}
