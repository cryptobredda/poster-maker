import { fetchPrayerTimesForRange, calculateJamaatTimes } from './api';
import { generatePoster, generateTemplatePreview, buildTableSvg, renderTablePng } from './poster';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildTitle(monthLabel: string, year: number, times: any[]): string {
  const hijriYears = [...new Set(times.map(t => t.hijriYear))].sort();
  let hijriYearStr = '';
  if (hijriYears.length === 1) {
    hijriYearStr = `${hijriYears[0]} AH`;
  } else if (hijriYears.length === 2) {
    const y1 = hijriYears[0];
    const y2 = hijriYears[1];
    const y2Short = String(y2).slice(-2);
    hijriYearStr = `${y1}/${y2Short} AH`;
  } else if (hijriYears.length > 2) {
    const y1 = hijriYears[0];
    const y2 = hijriYears[hijriYears.length - 1];
    const y2Short = String(y2).slice(-2);
    hijriYearStr = `${y1}/${y2Short} AH`;
  }
  return `${monthLabel} ${year} - ${hijriYearStr}`;
}

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.searchParams.has('template')) {
      try {
        const result = await generateTemplatePreview();
        return new Response(result.data as any, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600',
            'Content-Disposition': 'inline; filename="prayer-template-preview.png"',
          },
        });
      } catch (error) {
        console.error('Error generating template preview:', error);
        return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }

    if (url.searchParams.has('debug')) {
      try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 21);
        const { times: prayerTimes, monthLabel } = await fetchPrayerTimesForRange(startDate, endDate);
        const timesWithJamaat = calculateJamaatTimes(prayerTimes);
        const title = buildTitle(monthLabel, today.getFullYear(), timesWithJamaat);
        const svg = await buildTableSvg(timesWithJamaat, monthLabel);
        return new Response(svg, {
          headers: { 'Content-Type': 'image/svg+xml' },
        });
      } catch (error) {
        return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }

    if (url.searchParams.has('tablepng')) {
      try {
        const result = await renderTablePng();
        return new Response(result as any, {
          headers: { 'Content-Type': 'image/png' },
        });
      } catch (error) {
        return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }

    const skipCache = url.searchParams.has('nocache');
    const cacheKey = new Request(`${url.origin}/?date=${todayKey()}`, { method: 'GET' });
    if (!skipCache) {
      const cache = (caches as any).default as Cache;
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    }

    try {
      const today = new Date();

      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);

      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 21);

      const { times: prayerTimes, monthLabel } = await fetchPrayerTimesForRange(startDate, endDate);
      const timesWithJamaat = calculateJamaatTimes(prayerTimes);

      const title = buildTitle(monthLabel, today.getFullYear(), timesWithJamaat);
      const result = await generatePoster(timesWithJamaat, today.getFullYear(), monthLabel, title);

      const response = new Response(result.data as any, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
          'Content-Disposition': 'inline; filename="prayer-times-rolling.png"',
        },
      });

      if (!skipCache) {
        const cache = (caches as any).default as Cache;
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
      return response;
    } catch (error) {
      console.error('Error generating poster:', error);
      return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};