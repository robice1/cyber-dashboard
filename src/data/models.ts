export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
export type VulnerabilityStatus = 'Open' | 'Resolved'
export type RepositoryId = string
export type Scanner = 'CodeQL' | 'Dependabot' | 'Secret Scanning' | 'DAST' | 'Container Scanning'

export type AffectedComponent = {
  name: string
  version?: string
  revision?: string
  environment?: string
}

export type CvssAssessment = {
  version: '3.1'
  baseScore: number
  vector?: string
}

export type Vulnerability = {
  id: string
  cveId?: string
  title: string
  affectedComponent: AffectedComponent
  scanner: Scanner
  cweId: string
  severity: Severity
  status: VulnerabilityStatus
  repositoryId: RepositoryId
  discoveredAt: string
  resolvedAt?: string
  cvss: CvssAssessment
}

export type Repository = {
  id: RepositoryId
  name: string
  primaryLanguage: string
  lastScannedAt: string
}

export type TrendPoint = {
  month: string
  opened: number
  resolved: number
}

export type DashboardSnapshot = {
  repositories: Repository[]
  vulnerabilities: Vulnerability[]
}