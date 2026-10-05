import type { TrendPoint, Vulnerability } from './models'

const DAY_MS = 24 * 60 * 60 * 1000

export type DateRange = '30' | '90' | '365'

export function filterFindingsByRange(
  findings: Vulnerability[],
  range: DateRange,
  now = Date.now(),
): Vulnerability[] {
  const start = now - Number(range) * DAY_MS
  return findings.filter((finding) => {
    const detectedAt = Date.parse(finding.discoveredAt)
    return detectedAt >= start && detectedAt <= now
  })
}

function monthKey(timestamp: string): string {
  const date = new Date(timestamp)
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function buildMonthlyTrend(
  findings: Vulnerability[],
  now = Date.now(),
): TrendPoint[] {
  const currentDate = new Date(now)
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 11 + index, 1))
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    const label = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC',
    }).format(date)
    return { key, point: { month: label, opened: 0, resolved: 0 } }
  })
  const monthByKey = new Map(months.map(({ key, point }) => [key, point]))

  for (const finding of findings) {
    const discoveredMonth = monthByKey.get(monthKey(finding.discoveredAt))
    if (discoveredMonth) discoveredMonth.opened += 1

    if (finding.resolvedAt) {
      const resolvedMonth = monthByKey.get(monthKey(finding.resolvedAt))
      if (resolvedMonth) resolvedMonth.resolved += 1
    }
  }

  return months.map(({ point }) => point)
}