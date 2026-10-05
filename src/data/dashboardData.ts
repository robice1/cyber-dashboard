import type { DashboardSnapshot, Repository, Scanner, Severity, Vulnerability } from './models'

const TOTAL_FINDINGS = 500
const YEAR_MS = 365 * 24 * 60 * 60 * 1000
const repositoryFindingCounts = [52, 44, 39, 35, 32, 29, 27, 25, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 19]

const repositoryDefinitions = [
  ['web-platform', 'TypeScript'], ['api-gateway', 'Go'], ['customer-portal', 'TypeScript'],
  ['infra-terraform', 'HCL'], ['auth-service', 'Python'], ['billing-service', 'Go'],
  ['mobile-ios', 'Swift'], ['mobile-android', 'Kotlin'], ['data-pipeline', 'Python'],
  ['analytics-worker', 'Python'], ['identity-provider', 'Go'], ['admin-console', 'TypeScript'],
  ['docs-site', 'TypeScript'], ['notification-service', 'Java'], ['search-indexer', 'Java'],
  ['edge-proxy', 'Rust'], ['image-processor', 'Go'], ['checkout-service', 'Java'],
  ['reporting-api', 'C#'], ['developer-portal', 'TypeScript'],
] as const

type FindingTemplate = {
  title: string
  cweId: string
  component: string
  versions?: string[]
  revisions?: string[]
  environments?: string[]
}

type ScannerDefinition = {
  name: Scanner
  distribution: Record<Severity, number>
  templates: FindingTemplate[]
}

const scannerDefinitions: ScannerDefinition[] = [
  {
    name: 'CodeQL',
    distribution: { Critical: 8, High: 36, Medium: 76, Low: 40 },
    templates: [
      { title: 'SQL injection in request handler', cweId: 'CWE-89', component: 'src/routes/search.ts', revisions: ['main', 'release/2.8'] },
      { title: 'Cross-site scripting through untrusted output', cweId: 'CWE-79', component: 'src/views/profile.tsx', revisions: ['main', 'release/3.1'] },
      { title: 'Path traversal in file download route', cweId: 'CWE-22', component: 'src/controllers/files.ts', revisions: ['main', 'release/1.6'] },
      { title: 'Server-side request forgery in URL preview', cweId: 'CWE-918', component: 'src/services/preview.ts', revisions: ['main', 'release/2.4'] },
      { title: 'Command injection in diagnostic endpoint', cweId: 'CWE-78', component: 'src/routes/diagnostics.ts', revisions: ['main', 'release/4.0'] },
      { title: 'Insecure direct object reference', cweId: 'CWE-639', component: 'src/controllers/accounts.ts', revisions: ['main', 'release/1.9'] },
      { title: 'Unvalidated redirect in callback handler', cweId: 'CWE-601', component: 'src/auth/callback.ts', revisions: ['main', 'release/2.2'] },
      { title: 'Missing authorization check on resource', cweId: 'CWE-862', component: 'src/policies/resource.ts', revisions: ['main', 'release/3.5'] },
    ],
  },
  {
    name: 'Dependabot',
    distribution: { Critical: 5, High: 28, Medium: 75, Low: 37 },
    templates: [
      { title: 'Vulnerable dependency: lodash', cweId: 'CWE-1395', component: 'lodash', versions: ['4.17.20', '4.17.21'] },
      { title: 'Vulnerable dependency: jsonwebtoken', cweId: 'CWE-1395', component: 'jsonwebtoken', versions: ['8.5.1', '9.0.0'] },
      { title: 'Vulnerable dependency: axios', cweId: 'CWE-1395', component: 'axios', versions: ['0.27.2', '1.5.1'] },
      { title: 'Vulnerable dependency: semver', cweId: 'CWE-1395', component: 'semver', versions: ['7.3.8', '7.5.2'] },
      { title: 'Vulnerable dependency: express', cweId: 'CWE-1395', component: 'express', versions: ['4.18.1', '4.18.2'] },
      { title: 'Vulnerable dependency: yaml', cweId: 'CWE-1395', component: 'yaml', versions: ['1.10.0', '2.3.1'] },
      { title: 'Vulnerable dependency: follow-redirects', cweId: 'CWE-1395', component: 'follow-redirects', versions: ['1.14.8', '1.15.2'] },
      { title: 'Vulnerable dependency: glob-parent', cweId: 'CWE-1395', component: 'glob-parent', versions: ['5.1.2', '6.0.2'] },
    ],
  },
  {
    name: 'Secret Scanning',
    distribution: { Critical: 4, High: 12, Medium: 26, Low: 13 },
    templates: [
      { title: 'Potential cloud credential committed', cweId: 'CWE-798', component: 'config/deploy.env', revisions: ['commit'] },
      { title: 'Potential source-control access token exposed', cweId: 'CWE-798', component: 'config/ci-settings.yml', revisions: ['commit'] },
      { title: 'Potential signing key material committed', cweId: 'CWE-321', component: 'src/config/signing.ts', revisions: ['commit'] },
      { title: 'Credential stored without adequate protection', cweId: 'CWE-522', component: 'config/service.properties', revisions: ['commit'] },
      { title: 'Sensitive value written to application log', cweId: 'CWE-532', component: 'src/logging/request.ts', revisions: ['commit'] },
    ],
  },
  {
    name: 'DAST',
    distribution: { Critical: 5, High: 20, Medium: 32, Low: 13 },
    templates: [
      { title: 'SQL injection in API parameter', cweId: 'CWE-89', component: '/api/v1/search', environments: ['staging'] },
      { title: 'Reflected cross-site scripting', cweId: 'CWE-79', component: '/account/redirect', environments: ['staging'] },
      { title: 'Cross-site request forgery on state change', cweId: 'CWE-352', component: '/api/v1/profile', environments: ['staging'] },
      { title: 'Server-side request forgery in import endpoint', cweId: 'CWE-918', component: '/api/v1/import', environments: ['staging'] },
      { title: 'Path traversal in download parameter', cweId: 'CWE-22', component: '/download', environments: ['staging'] },
      { title: 'XML external entity processing enabled', cweId: 'CWE-611', component: '/api/v1/documents', environments: ['staging'] },
      { title: 'Unrestricted file upload accepts unsafe type', cweId: 'CWE-434', component: '/api/v1/uploads', environments: ['staging'] },
      { title: 'Missing security headers on application route', cweId: 'CWE-693', component: '/', environments: ['staging'] },
    ],
  },
  {
    name: 'Container Scanning',
    distribution: { Critical: 5, High: 20, Medium: 32, Low: 13 },
    templates: [
      { title: 'Vulnerable OS package in container image', cweId: 'CWE-1395', component: 'registry.local/platform/api', versions: ['1.8.2', '2.1.0'] },
      { title: 'Container runs with unnecessary privileges', cweId: 'CWE-250', component: 'registry.local/platform/worker', versions: ['3.4.1', '3.5.0'] },
      { title: 'Untrusted base image is not pinned', cweId: 'CWE-829', component: 'registry.local/platform/frontend', versions: ['5.2.0', '5.3.1'] },
      { title: 'Package manager cache retained in image layer', cweId: 'CWE-459', component: 'registry.local/platform/batch', versions: ['2.7.3', '2.8.0'] },
      { title: 'Container image uses an end-of-life runtime', cweId: 'CWE-1104', component: 'registry.local/platform/runtime', versions: ['1.12.4', '1.13.0'] },
      { title: 'Writable root filesystem in deployment image', cweId: 'CWE-732', component: 'registry.local/platform/service', versions: ['4.0.2', '4.1.0'] },
      { title: 'Excessive Linux capabilities configured', cweId: 'CWE-250', component: 'registry.local/platform/edge', versions: ['2.3.2', '2.4.0'] },
      { title: 'Sensitive build artifact included in image', cweId: 'CWE-200', component: 'registry.local/platform/release', versions: ['6.1.0', '6.2.1'] },
    ],
  },
]

const severityScoreRanges: Record<Severity, [number, number]> = {
  Critical: [9.0, 10.0],
  High: [7.0, 8.9],
  Medium: [4.0, 6.9],
  Low: [0.1, 3.9],
}

const resolutionRates: Record<Severity, number> = {
  Critical: 0.42,
  High: 0.54,
  Medium: 0.67,
  Low: 0.76,
}

function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    return state / 4_294_967_296
  }
}

function shuffle<T>(items: T[], random: () => number) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[items[index], items[swapIndex]] = [items[swapIndex], items[index]]
  }
  return items
}

function buildSeverityList(distribution: Record<Severity, number>) {
  return (Object.entries(distribution) as [Severity, number][])
    .flatMap(([severity, count]) => Array.from({ length: count }, () => severity))
}

function createFinding(
  id: number,
  scanner: ScannerDefinition,
  severity: Severity,
  repository: Repository,
  random: () => number,
  now: number,
): Vulnerability {
  const template = scanner.templates[Math.floor(random() * scanner.templates.length)]
  const [minimumScore, maximumScore] = severityScoreRanges[severity]
  const score = minimumScore + Math.floor(random() * (Math.round((maximumScore - minimumScore) * 10) + 1)) / 10
  const detectionOffsetMs = 1 + Math.floor(random() * YEAR_MS)
  const detectedAt = new Date(now - detectionOffsetMs)
  const daysAgo = Math.floor(detectionOffsetMs / (24 * 60 * 60 * 1000))
  const ageResolutionBoost = daysAgo > 180 ? 0.16 : daysAgo > 60 ? 0.08 : 0
  const isResolved = random() < Math.min(0.95, resolutionRates[severity] + ageResolutionBoost)
  const maximumResolutionDays = severity === 'Critical' ? 30 : severity === 'High' ? 60 : 120
  const maximumResolutionMs = Math.min(detectionOffsetMs, maximumResolutionDays * 24 * 60 * 60 * 1000)
  const resolutionDelayMs = 1 + Math.floor(random() * maximumResolutionMs)
  const resolvedAt = new Date(detectedAt.getTime() + resolutionDelayMs)

  return {
    id: `finding-${String(id).padStart(4, '0')}`,
    title: template.title,
    affectedComponent: {
      name: template.component,
      ...(template.versions ? { version: template.versions[Math.floor(random() * template.versions.length)] } : {}),
      ...(template.revisions ? { revision: template.revisions[Math.floor(random() * template.revisions.length)] } : {}),
      ...(template.environments ? { environment: template.environments[Math.floor(random() * template.environments.length)] } : {}),
    },
    scanner: scanner.name,
    cweId: template.cweId,
    severity,
    status: isResolved ? 'Resolved' : 'Open',
    repositoryId: repository.id,
    discoveredAt: detectedAt.toISOString(),
    ...(isResolved ? { resolvedAt: resolvedAt.toISOString() } : {}),
    cvss: { version: '3.1', baseScore: Number(score.toFixed(1)) },
  }
}

function createRepositories(now: number, random: () => number): Repository[] {
  return repositoryDefinitions.map(([id, primaryLanguage]) => ({
    id,
    name: id,
    primaryLanguage,
    lastScannedAt: new Date(now - (5 + Math.floor(random() * 360)) * 60_000).toISOString(),
  }))
}

function takeRepository(remainingCounts: number[], repositories: Repository[], random: () => number) {
  const remainingTotal = remainingCounts.reduce((total, count) => total + count, 0)
  let selection = Math.floor(random() * remainingTotal)

  for (let index = 0; index < remainingCounts.length; index += 1) {
    selection -= remainingCounts[index]
    if (selection < 0) {
      remainingCounts[index] -= 1
      return repositories[index]
    }
  }

  throw new Error('Unable to assign a repository to mock finding')
}

export function createMockDashboardData(now = Date.now(), seed = 20_261_005): DashboardSnapshot {
  const random = createRandom(seed)
  const repositories = createRepositories(now, random)
  const remainingRepositoryCounts = [...repositoryFindingCounts]
  const vulnerabilities: Vulnerability[] = []

  for (const scanner of scannerDefinitions) {
    const severityList = shuffle(buildSeverityList(scanner.distribution), random)
    for (const severity of severityList) {
      const repository = takeRepository(remainingRepositoryCounts, repositories, random)
      vulnerabilities.push(
        createFinding(vulnerabilities.length + 1, scanner, severity, repository, random, now),
      )
    }
  }

  if (vulnerabilities.length !== TOTAL_FINDINGS) {
    throw new Error(`Expected ${TOTAL_FINDINGS} mock findings, got ${vulnerabilities.length}`)
  }

  return { repositories, vulnerabilities }
}

export const mockDashboardData = createMockDashboardData()