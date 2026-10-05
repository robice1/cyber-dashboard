export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'

export type Vulnerability = {
  id: string
  title: string
  packageName: string
  version: string
  severity: Severity
  status: 'Open' | 'Resolved'
  repository: string
  discovered: string
  cvss: number
  repoTone: string
  repoInitial: string
}

export type Repository = {
  name: string
  initial: string
  tone: string
  language: string
  languageTone: string
  updated: string
}

export type TrendPoint = { month: string; opened: number; resolved: number }

export const repositories: Repository[] = [
  { name: 'web-platform', initial: 'W', tone: 'mint', language: 'TypeScript', languageTone: 'blue', updated: '12m ago' },
  { name: 'api-gateway', initial: 'A', tone: 'blue', language: 'Go', languageTone: 'cyan', updated: '28m ago' },
  { name: 'customer-portal', initial: 'C', tone: 'amber', language: 'React', languageTone: 'cyan', updated: '1h ago' },
  { name: 'infra-terraform', initial: 'I', tone: 'rose', language: 'HCL', languageTone: 'purple', updated: '3h ago' },
  { name: 'auth-service', initial: 'A', tone: 'violet', language: 'Python', languageTone: 'yellow', updated: '5h ago' },
]

export const vulnerabilities: Vulnerability[] = [
  { id: 'CVE-2026-1842', title: 'Prototype pollution in object-path', packageName: 'object-path', version: '0.11.8', severity: 'Critical', status: 'Open', repository: 'web-platform', discovered: 'Oct 04, 2026', cvss: 9.8, repoTone: 'mint', repoInitial: 'W' },
  { id: 'CVE-2026-0917', title: 'Remote code execution in libarchive', packageName: 'libarchive', version: '3.6.1', severity: 'Critical', status: 'Open', repository: 'api-gateway', discovered: 'Oct 03, 2026', cvss: 9.4, repoTone: 'blue', repoInitial: 'A' },
  { id: 'CVE-2026-2204', title: 'SQL injection in query builder', packageName: 'knex', version: '2.4.0', severity: 'Critical', status: 'Resolved', repository: 'customer-portal', discovered: 'Oct 02, 2026', cvss: 9.1, repoTone: 'amber', repoInitial: 'C' },
  { id: 'CVE-2026-0731', title: 'Improper certificate validation', packageName: 'undici', version: '5.19.1', severity: 'High', status: 'Open', repository: 'web-platform', discovered: 'Oct 02, 2026', cvss: 8.1, repoTone: 'mint', repoInitial: 'W' },
  { id: 'CVE-2026-1186', title: 'Path traversal in archive extraction', packageName: 'tar', version: '6.1.12', severity: 'High', status: 'Open', repository: 'api-gateway', discovered: 'Oct 01, 2026', cvss: 7.8, repoTone: 'blue', repoInitial: 'A' },
  { id: 'CVE-2026-2049', title: 'Cross-site scripting in markdown renderer', packageName: 'marked', version: '4.2.3', severity: 'High', status: 'Open', repository: 'customer-portal', discovered: 'Sep 30, 2026', cvss: 7.6, repoTone: 'amber', repoInitial: 'C' },
  { id: 'CVE-2026-0813', title: 'Denial of service in regular expression parser', packageName: 'brace-expansion', version: '2.0.0', severity: 'High', status: 'Open', repository: 'web-platform', discovered: 'Sep 29, 2026', cvss: 7.5, repoTone: 'mint', repoInitial: 'W' },
  { id: 'CVE-2026-1460', title: 'Weak JWT algorithm verification', packageName: 'jsonwebtoken', version: '8.5.1', severity: 'High', status: 'Resolved', repository: 'auth-service', discovered: 'Sep 28, 2026', cvss: 7.2, repoTone: 'violet', repoInitial: 'A' },
  { id: 'CVE-2026-2351', title: 'Information exposure in debug output', packageName: 'pino', version: '8.8.0', severity: 'Medium', status: 'Open', repository: 'api-gateway', discovered: 'Sep 27, 2026', cvss: 6.4, repoTone: 'blue', repoInitial: 'A' },
  { id: 'CVE-2026-1062', title: 'Inefficient regular expression complexity', packageName: 'path-to-regexp', version: '6.2.0', severity: 'Medium', status: 'Open', repository: 'web-platform', discovered: 'Sep 26, 2026', cvss: 6.1, repoTone: 'mint', repoInitial: 'W' },
  { id: 'CVE-2026-1973', title: 'Uncontrolled resource consumption', packageName: 'axios', version: '1.3.2', severity: 'Medium', status: 'Resolved', repository: 'customer-portal', discovered: 'Sep 24, 2026', cvss: 5.8, repoTone: 'amber', repoInitial: 'C' },
  { id: 'CVE-2026-0528', title: 'Missing authorization on admin route', packageName: 'express', version: '4.18.1', severity: 'Medium', status: 'Open', repository: 'auth-service', discovered: 'Sep 22, 2026', cvss: 5.5, repoTone: 'violet', repoInitial: 'A' },
  { id: 'CVE-2026-1734', title: 'Sensitive value in container image', packageName: 'app-server', version: '2.8.0', severity: 'Low', status: 'Open', repository: 'infra-terraform', discovered: 'Sep 21, 2026', cvss: 3.9, repoTone: 'rose', repoInitial: 'I' },
  { id: 'CVE-2026-1289', title: 'Outdated cryptographic configuration', packageName: 'tls-config', version: '1.4.2', severity: 'Low', status: 'Open', repository: 'api-gateway', discovered: 'Sep 19, 2026', cvss: 3.7, repoTone: 'blue', repoInitial: 'A' },
  { id: 'CVE-2026-2210', title: 'Verbose error message reveals internals', packageName: 'flask', version: '2.2.2', severity: 'Low', status: 'Resolved', repository: 'auth-service', discovered: 'Sep 18, 2026', cvss: 3.4, repoTone: 'violet', repoInitial: 'A' },
  { id: 'CVE-2026-0995', title: 'Insufficient session expiration', packageName: 'express-session', version: '1.17.2', severity: 'Low', status: 'Open', repository: 'customer-portal', discovered: 'Sep 16, 2026', cvss: 3.1, repoTone: 'amber', repoInitial: 'C' },
]

export const trendData: TrendPoint[] = [
  { month: 'Jul 06', opened: 18, resolved: 12 },
  { month: 'Jul 20', opened: 14, resolved: 17 },
  { month: 'Aug 03', opened: 21, resolved: 15 },
  { month: 'Aug 17', opened: 16, resolved: 22 },
  { month: 'Aug 31', opened: 24, resolved: 19 },
  { month: 'Sep 14', opened: 19, resolved: 27 },
  { month: 'Sep 28', opened: 28, resolved: 24 },
  { month: 'Oct 05', opened: 22, resolved: 31 },
]