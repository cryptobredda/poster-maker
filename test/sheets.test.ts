import test from 'node:test';
import assert from 'node:assert/strict';
import { findCurrentMonthTab, parseSheetConfigRows, sortMonthTabsChronologically } from '../src/sheets.js';

test('month tabs are selected chronologically rather than alphabetically', () => {
  const tabs = ['How To', 'September 2025', 'February 2027', 'December 2026', 'Config', 'January 26'];
  assert.deepEqual(sortMonthTabsChronologically(tabs), [
    'September 2025',
    'January 26',
    'December 2026',
    'February 2027',
  ]);
  assert.equal(findCurrentMonthTab(tabs, new Date('2026-07-15T12:00:00.000Z')), 'February 2027');
});

test('current tab selection uses the Europe/London month', () => {
  const tabs = ['March 2026', 'April 2026'];
  assert.equal(findCurrentMonthTab(tabs, new Date('2026-03-31T23:30:00.000Z')), 'April 2026');
});

test('correct dhuhrOffset is supported and takes precedence over legacy dhirOffset', () => {
  const config = parseSheetConfigRows([
    ['Setting', 'Value'],
    ['dhirOffset', '3'],
    ['dhuhrOffset', '7'],
  ]);
  assert.equal(config.timeOffsets.dhuhr, 7);
});

test('legacy dhirOffset remains supported', () => {
  const config = parseSheetConfigRows([
    ['Setting', 'Value'],
    ['dhirOffset', '-2'],
  ]);
  assert.equal(config.timeOffsets.dhuhr, -2);
});
