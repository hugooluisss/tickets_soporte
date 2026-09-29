import { describe, expect, it } from 'vitest';
import { priorityDonut, replyChartArea, replyChartPoints, replyChartPolyline, trendBarHeights } from './dashboard-charts';

describe('dashboard chart transforms', () => {
  it('handles empty reply series', () => { expect(replyChartPoints([])).toEqual([]); expect(replyChartPolyline([])).toBe(''); expect(replyChartArea([])).toBe(''); });
  it('maps a single reply point to the chart center', () => { expect(replyChartPoints([4])[0]).toEqual({ x: 280, y: 10 }); });
  it('maps multiple replies and creates a closed area baseline', () => { expect(replyChartPolyline([0, 2, 1])).toBe('0,170 280,10 560,90'); expect(replyChartArea([0, 2, 1])).toBe('0,180 0,170 280,10 560,90 560,180'); });
  it('gives priority arcs proportionate dash values and supports empty breakdowns', () => { expect(priorityDonut([])).toEqual([]); expect(priorityDonut([{ key: 'high', count: 1 }, { key: 'low', count: 3 }])).toEqual([{ key: 'high', count: 1, dasharray: '62.8 188.39999999999998', dashoffset: -0, color: '#ef4444' }, { key: 'low', count: 3, dasharray: '188.39999999999998 62.80000000000001', dashoffset: -62.8, color: '#10b981' }]); });
  it('scales bars against the maximum and supports an empty trend', () => { expect(trendBarHeights([])).toEqual([]); expect(trendBarHeights([{ date: '2026-01-01', created: 0, solved: 0 }, { date: '2026-01-02', created: 2, solved: 1 }])).toEqual([{ date: '2026-01-01', created: 0, solved: 0, createdHeight: 0, solvedHeight: 0 }, { date: '2026-01-02', created: 2, solved: 1, createdHeight: 100, solvedHeight: 50 }]); });
});
