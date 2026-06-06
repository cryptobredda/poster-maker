import 'dotenv/config';
import express from 'express';
import { generatePoster, generateTemplatePreview } from './poster.js';
import { getCurrentMonthData, getSheetTabs, findCurrentMonthTab, ensureHowToTab, ensureConfigTab, readTabColors, readConfig, rewriteTab, readTabGrid, getTabData, monthTabName } from './sheets.js';
import { syncMonthlyTabs, regenerateAllTabs } from './cron.js';
import { buildTitle, getJumuahTime } from './utils.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

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
    cache.delete('poster');
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

app.get('/poster', async (req, res) => {
  const skipCache = req.query.nocache === '1' || req.query['no-cache'] === '1';
  const cacheKey = 'poster';

  if (!skipCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' });
      res.send(cached);
      return;
    }
  }

  try {
    const monthParam = req.query.month ? parseInt(req.query.month as string, 10) : NaN;
    const yearParam = req.query.year ? parseInt(req.query.year as string, 10) : NaN;

    const config = await readConfig();
    await checkConfigChange(config);

    let times, tabName;
    let targetDate: Date;

    if (!isNaN(monthParam) && !isNaN(yearParam)) {
      targetDate = new Date(yearParam, monthParam - 1, 1);
      const targetTabName = monthTabName(targetDate);
      times = await getTabData(targetTabName, config);
      tabName = targetTabName;
    } else {
      const data = await getCurrentMonthData(config);
      times = data.times;
      tabName = data.tabName;
      targetDate = new Date();
    }

    const colors = await readTabColors(tabName, config);
    const grid = await readTabGrid(tabName, config);
    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    const title = buildTitle(monthLabel, targetDate.getFullYear(), times);
    const jumuahTime = getJumuahTime(times);

    const result = await generatePoster(times, targetDate.getFullYear(), monthLabel, title, jumuahTime, colors, config, grid);
    const buf = Buffer.from(result.data);

    if (!skipCache) setCached(cacheKey, buf);
    res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' });
    res.send(buf);
  } catch (error) {
    console.error('Error generating poster:', error);
    res.status(500).type('text').send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const monthParam = req.query.month ? parseInt(req.query.month as string, 10) : NaN;
    const yearParam = req.query.year ? parseInt(req.query.year as string, 10) : NaN;

    const config = await readConfig();

    let times, tabName;
    let targetDate: Date;

    if (!isNaN(monthParam) && !isNaN(yearParam)) {
      targetDate = new Date(yearParam, monthParam - 1, 1);
      const targetTabName = monthTabName(targetDate);
      times = await getTabData(targetTabName, config);
      tabName = targetTabName;
    } else {
      const data = await getCurrentMonthData(config);
      times = data.times;
      tabName = data.tabName;
      targetDate = new Date();
    }

    const colors = await readTabColors(tabName, config);
    const grid = await readTabGrid(tabName, config);
    const { buildTableSvg } = await import('./poster.js');
    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    const svg = await buildTableSvg(times, monthLabel, colors, config, grid);
    res.set({ 'Content-Type': 'image/svg+xml' });
    res.send(svg);
  } catch (error) {
    res.status(500).type('text').send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

app.get('/cron/sync', async (req, res) => {
  const secret = (req.query.secret as string) || req.headers['x-cron-secret'] as string;
  if (secret !== process.env.CRON_SECRET) {
    res.status(401).type('text').send('Unauthorized');
    return;
  }

  try {
    const result = await syncMonthlyTabs();
    res.type('text').send(`Synced. Created tabs: ${result.created.join(', ') || 'none'}`);
  } catch (error) {
    console.error('Error in cron sync:', error);
    res.status(500).type('text').send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

app.post('/cron/sync', async (req, res) => {
  const secret = (req.query.secret as string) || req.headers['x-cron-secret'] as string;
  if (secret !== process.env.CRON_SECRET) {
    res.status(401).type('text').send('Unauthorized');
    return;
  }

  try {
    const result = await syncMonthlyTabs();
    res.type('text').send(`Synced. Created tabs: ${result.created.join(', ') || 'none'}`);
  } catch (error) {
    console.error('Error in cron sync:', error);
    res.status(500).type('text').send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

app.post('/cron/rewrite', async (req, res) => {
  const secret = (req.query.secret as string) || req.headers['x-cron-secret'] as string;
  if (secret !== process.env.CRON_SECRET) {
    res.status(401).type('text').send('Unauthorized');
    return;
  }

  try {
    const config = await readConfig();
    const tabs = await getSheetTabs();
    const startFilter = (req.query.start as string) || '';
    const endFilter = (req.query.end as string) || '';

    const rewritten: string[] = [];
    for (const tab of tabs) {
      if (tab === 'How To' || tab === 'Config') continue;
      if (startFilter && tab.localeCompare(startFilter) < 0) continue;
      if (endFilter && tab.localeCompare(endFilter) > 0) continue;
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
  const secret = (req.query.secret as string) || req.headers['x-cron-secret'] as string;
  if (secret !== process.env.CRON_SECRET) {
    res.status(401).type('text').send('Unauthorized');
    return;
  }

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

    const now = new Date();
    if (now.getDate() >= 25) {
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

start();
