export interface Point { x: number; y: number; }
export function replyChartPoints(values: readonly number[], width = 560, height = 180): Point[] {
  if (!values.length) return [];
  const max = Math.max(1, ...values);
  return values.map((value, index) => ({ x: values.length === 1 ? width / 2 : index * width / (values.length - 1), y: height - (Math.max(0, value) / max) * (height - 20) - 10 }));
}
export function replyChartPolyline(values: readonly number[], width = 560, height = 180): string {
  return replyChartPoints(values, width, height).map(p => `${p.x},${p.y}`).join(' ');
}
export function replyChartArea(values: readonly number[], width = 560, height = 180): string {
  const points = replyChartPoints(values, width, height);
  if (!points.length) return '';
  return `0,${height} ${points.map(p => `${p.x},${p.y}`).join(' ')} ${width},${height}`;
}
export interface DonutArc { key: string; count: number; dasharray: string; dashoffset: number; color: string; }
const PRIORITY_COLORS: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
export function priorityDonut(values: readonly { key: string; count: number }[], circumference = 251.2): DonutArc[] {
  const total = values.reduce((sum, row) => sum + Math.max(0, row.count), 0);
  let offset = 0;
  return values.map(row => {
    const segment = total ? Math.max(0, row.count) / total * circumference : 0;
    const arc = { key: row.key, count: row.count, dasharray: `${segment} ${circumference - segment}`, dashoffset: -offset, color: PRIORITY_COLORS[row.key] ?? '#94a3b8' };
    offset += segment;
    return arc;
  });
}
export interface TrendBar { date: string; created: number; solved: number; createdHeight: number; solvedHeight: number; }
export function trendBarHeights(values: readonly { date: string; created: number; solved: number }[]): TrendBar[] {
  const max = Math.max(1, ...values.flatMap(row => [row.created, row.solved]));
  return values.map(row => ({ ...row, createdHeight: Math.max(0, row.created) / max * 100, solvedHeight: Math.max(0, row.solved) / max * 100 }));
}
