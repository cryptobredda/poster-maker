import 'dotenv/config';
import express from 'express';
import { generatePoster, generateTemplatePreview } from './poster.js';
import { getCurrentMonthData, getSheetTabs, findCurrentMonthTab, ensureHowToTab, ensureConfigTab, readTabColors, readConfig, rewriteTab, readTabGrid } from './sheets.js';
import { syncMonthlyTabs } from './cron.js';
import { buildTitle, getTodaysJumuahTime } from './utils.js';

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

app.get('/poster', async (req, res) => {
  const skipCache = req.query.nocache === '1';

  if (!skipCache) {
    const cached = getCached('poster');
    if (cached) {
      res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' });
      res.send(cached);
      return;
    }
  }

  try {
    const { times, tabName } = await getCurrentMonthData();
    const colors = await readTabColors(tabName);
    const config = await readConfig();
    const grid = await readTabGrid(tabName);
    const today = new Date();
    const monthLabel = today.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    const title = buildTitle(monthLabel, today.getFullYear(), times);
    const jumuahTime = getTodaysJumuahTime(times);

    const result = await generatePoster(times, today.getFullYear(), monthLabel, title, jumuahTime, colors, config, grid);
    const buf = Buffer.from(result.data);

    setCached('poster', buf);
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

app.get('/table-svg', async (_req, res) => {
  try {
    const { times, tabName } = await getCurrentMonthData();
    const colors = await readTabColors(tabName);
    const config = await readConfig();
    const grid = await readTabGrid(tabName);
    const { buildTableSvg } = await import('./poster.js');
    const today = new Date();
    const monthLabel = today.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
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
    const tabs = await getSheetTabs();
    const startFilter = (req.query.start as string) || '';
    const endFilter = (req.query.end as string) || '';

    const rewritten: string[] = [];
    for (const tab of tabs) {
      if (tab === 'How To' || tab === 'Config') continue;
      if (startFilter && tab.localeCompare(startFilter) < 0) continue;
      if (endFilter && tab.localeCompare(endFilter) > 0) continue;
      await rewriteTab(tab);
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

  setInterval(async () => {
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
