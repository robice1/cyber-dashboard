import { describe, expect, it } from 'vitest'
import { createMockDashboardData, mockDashboardData } from '../src/data/dashboardData'
import { buildMonthlyTrend, filterFindingsByRange } from '../src/data/analytics'
import type { Scanner, Severity } from '../src/data/models'

describe('mock dashboard data', () => {
  it('generates 500 findings across 20 repositories and all five scanners', () => {
    expect(mockDashboardData.vulnerabilities).toHaveLength(500)
    expect(mockDashboardData.repositories).toHaveLength(20)
    expect(new Set(mockDashboardData.vulnerabilities.map((finding) => finding.scanner))).toEqual(
      new Set<Scanner>(['CodeQL', 'Dependabot', 'Secret Scanning', 'DAST', 'Container Scanning']),
    )

    const repositoryCounts = mockDashboardData.repositories.map((repository) =>
      mockDashboardData.vulnerabilities.filter((finding) => finding.repositoryId === repository.id).length,
    )
    expect(repositoryCounts.every((count) => count > 0)).toBe(true)
    expect(Math.max(...repositoryCounts)).toBeGreaterThan(Math.min(...repositoryCounts) * 2)

    const scannerCounts = new Map<Scanner, number>()
    for (const finding of mockDashboardData.vulnerabilities) {
      scannerCounts.set(finding.scanner, (scannerCounts.get(finding.scanner) ?? 0) + 1)
    }
    expect(scannerCounts).toEqual(new Map([
      ['CodeQL', 160],
      ['Dependabot', 145],
      ['Secret Scanning', 55],
      ['DAST', 70],
      ['Container Scanning', 70],
    ]))
  })

  it('uses unique repository and finding IDs with valid repository references', () => {
    const repositoryIds = mockDashboardData.repositories.map((repository) => repository.id)
    const findingIds = mockDashboardData.vulnerabilities.map((finding) => finding.id)

    expect(new Set(repositoryIds).size).toBe(repositoryIds.length)
    expect(new Set(findingIds).size).toBe(findingIds.length)
    expect(mockDashboardData.vulnerabilities.every((finding) => repositoryIds.includes(finding.repositoryId))).toBe(true)
    expect(mockDashboardData.vulnerabilities.every((finding) => finding.id !== finding.cveId)).toBe(true)
  })

  it('uses ISO timestamps and bounded, versioned CVSS scores', () => {
    for (const repository of mockDashboardData.repositories) {
      expect(new Date(repository.lastScannedAt).toISOString()).toBe(repository.lastScannedAt)
    }

    for (const finding of mockDashboardData.vulnerabilities) {
      expect(new Date(finding.discoveredAt).toISOString()).toBe(finding.discoveredAt)
      if (finding.resolvedAt) {
        expect(new Date(finding.resolvedAt).toISOString()).toBe(finding.resolvedAt)
      }
      expect(finding.cvss.version).toBe('3.1')
      expect(finding.cvss.baseScore).toBeGreaterThanOrEqual(0)
      expect(finding.cvss.baseScore).toBeLessThanOrEqual(10)
    }
  })

  it('keeps findings in the trailing year and assigns dates consistently by status', () => {
    const now = Date.now()
    const oldestAllowed = now - 365 * 24 * 60 * 60 * 1000
    const severities: Record<Severity, number[]> = { Critical: [], High: [], Medium: [], Low: [] }

    for (const finding of mockDashboardData.vulnerabilities) {
      const detectedAt = Date.parse(finding.discoveredAt)
      expect(detectedAt).toBeGreaterThanOrEqual(oldestAllowed)
      expect(detectedAt).toBeLessThanOrEqual(now)
      severities[finding.severity].push(finding.cvss.baseScore)

      if (finding.status === 'Resolved') {
        expect(finding.resolvedAt).toBeDefined()
        expect(Date.parse(finding.resolvedAt!)).toBeGreaterThan(detectedAt)
        expect(Date.parse(finding.resolvedAt!)).toBeLessThanOrEqual(now)
      } else {
        expect(finding.resolvedAt).toBeUndefined()
      }
    }

    expect(severities.Critical.length).toBeLessThan(severities.Medium.length)
    expect(severities.Critical.every((score) => score >= 9)).toBe(true)
    expect(severities.High.every((score) => score >= 7 && score < 9)).toBe(true)
    expect(severities.Medium.every((score) => score >= 4 && score < 7)).toBe(true)
    expect(severities.Low.every((score) => score > 0 && score < 4)).toBe(true)
  })

  it('generates the same data for a fixed seed and timestamp', () => {
    expect(createMockDashboardData(1_791_202_500_000, 42)).toEqual(
      createMockDashboardData(1_791_202_500_000, 42),
    )
  })
})

describe('dashboard analytics', () => {
  it('filters findings to the requested trailing date range', () => {
    const now = Date.parse('2026-10-05T00:00:00.000Z')
    const recent = { ...mockDashboardData.vulnerabilities[0], discoveredAt: '2026-09-20T00:00:00.000Z' }
    const old = { ...mockDashboardData.vulnerabilities[1], discoveredAt: '2026-07-10T00:00:00.000Z' }

    expect(filterFindingsByRange([recent, old], '30', now)).toEqual([recent])
    expect(filterFindingsByRange([recent, old], '90', now)).toEqual([recent, old])
  })

  it('aggregates opened and resolved findings from their event dates', () => {
    const now = Date.parse('2026-10-05T00:00:00.000Z')
    const finding = {
      ...mockDashboardData.vulnerabilities[0],
      discoveredAt: '2026-09-10T00:00:00.000Z',
      status: 'Resolved' as const,
      resolvedAt: '2026-10-02T00:00:00.000Z',
    }
    const trend = buildMonthlyTrend([finding], now)

    expect(trend).toHaveLength(12)
    expect(trend.find((point) => point.month === 'Sep 26')?.opened).toBe(1)
    expect(trend.find((point) => point.month === 'Oct 26')?.resolved).toBe(1)
  })
})