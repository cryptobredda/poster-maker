import { fetchPrayerTimesForRange, calculateJamaatTimes } from './api';
import { generatePoster, generateTemplatePreview, buildTableSvg, renderTablePng } from './poster';

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

    try {
      const today = new Date();

      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);

      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 21);

      const { times: prayerTimes, monthLabel } = await fetchPrayerTimesForRange(startDate, endDate);
      const timesWithJamaat = calculateJamaatTimes(prayerTimes);

      const result = await generatePoster(timesWithJamaat, today.getFullYear(), monthLabel);

      return new Response(result.data as any, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
          'Content-Disposition': 'inline; filename="prayer-times-rolling.png"',
        },
      });
    } catch (error) {
      console.error('Error generating poster:', error);
      return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};