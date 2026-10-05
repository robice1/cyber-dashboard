import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Bell,
  Calculator,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Command,
  ExternalLink,
  GitBranch,
  LayoutDashboard,
  ListFilter,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { mockDashboardData } from './data/dashboardData'
import { buildMonthlyTrend, filterFindingsByRange, type DateRange } from './data/analytics'
import type { Scanner, Severity, Vulnerability } from './data/models'
import './App.css'

const TrendChart = lazy(() => import('./components/TrendChart'))
const CvssCalculator = lazy(() => import('./components/CvssCalculator'))
const { repositories, vulnerabilities } = mockDashboardData
const repositoryById = new Map(repositories.map((repository) => [repository.id, repository]))
const repositoryTonePalette = ['mint', 'blue', 'amber', 'rose', 'violet']
const languageTones: Record<string, string> = {
  TypeScript: 'blue',
  Go: 'cyan',
  React: 'cyan',
  HCL: 'purple',
  Python: 'yellow',
  Swift: 'rose',
  Kotlin: 'violet',
  Java: 'amber',
  Rust: 'rose',
  'C#': 'blue',
}

type SeverityFilter = Severity | 'All'
type StatusFilter = Vulnerability['status'] | 'All'
type ScannerFilter = Scanner | 'All scanners'

const severityFilters: SeverityFilter[] = ['All', 'Critical', 'High', 'Medium', 'Low']
const statusFilters: StatusFilter[] = ['All', 'Open', 'Resolved']
const scannerFilters: Scanner[] = ['CodeQL', 'Dependabot', 'Secret Scanning', 'DAST', 'Container Scanning']
const dateRangeLabels: Record<DateRange, string> = {
  '30': 'Last 30 days',
  '90': 'Last 90 days',
  '365': 'Last 12 months',
}

const severityStyles: Record<Severity, string> = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
}

const formatCount = (value: number) => value.toString().padStart(2, '0')
const repositoryTone = (repositoryId: string) => {
  const paletteIndex = [...repositoryId].reduce((total, character) => total + character.charCodeAt(0), 0)
  return repositoryTonePalette[paletteIndex % repositoryTonePalette.length]
}
const languageTone = (language: string) => languageTones[language] ?? 'blue'
const scannerClassName = (scanner: Scanner) => scanner.toLowerCase().replaceAll(' ', '-')

const formatDate = (timestamp: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(timestamp))

const formatScanAge = (timestamp: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(timestamp)) / 60_000))
  return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`
}

function App() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [scannerFilter, setScannerFilter] = useState<ScannerFilter>('All scanners')
  const [dateRange, setDateRange] = useState<DateRange>('365')
  const [repositoryFilter, setRepositoryFilter] = useState('All repositories')
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState('Overview')
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInput.current?.focus()
      }
    }
    window.addEventListener('keydown', handleSearchShortcut)
    return () => window.removeEventListener('keydown', handleSearchShortcut)
  }, [])

  const findingsInRange = useMemo(
    () => filterFindingsByRange(vulnerabilities, dateRange),
    [dateRange],
  )
  const dashboardFindings = findingsInRange

  const severityCounts = useMemo(() => {
    return dashboardFindings.reduce<Record<Severity, number>>(
      (counts, vulnerability) => {
        counts[vulnerability.severity] += 1
        return counts
      },
      { Critical: 0, High: 0, Medium: 0, Low: 0 },
    )
  }, [dashboardFindings])

  const openCount = dashboardFindings.filter((item) => item.status === 'Open').length
  const resolvedCount = dashboardFindings.length - openCount
  const resolutionPercent = dashboardFindings.length
    ? Math.round((resolvedCount / dashboardFindings.length) * 100)
    : 0
  const severityOpenCounts = dashboardFindings.reduce<Record<Severity, number>>(
    (counts, finding) => {
      if (finding.status === 'Open') counts[finding.severity] += 1
      return counts
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 },
  )
  const trendData = useMemo(() => buildMonthlyTrend(dashboardFindings), [dashboardFindings])
  const openedInRange = trendData.reduce((total, point) => total + point.opened, 0)
  const resolvedInRange = trendData.reduce((total, point) => total + point.resolved, 0)
  const scannedRepositoryCount = repositories.filter((repository) => repository.lastScannedAt).length
  const scannerCount = new Set(vulnerabilities.map((finding) => finding.scanner)).size
  const latestScan = repositories.reduce(
    (latest, repository) => Date.parse(repository.lastScannedAt) > Date.parse(latest)
      ? repository.lastScannedAt
      : latest,
    repositories[0]?.lastScannedAt ?? new Date(0).toISOString(),
  )

  const repositoryStats = useMemo(() => {
    return repositories.map((repository) => {
      const findings = dashboardFindings.filter((item) => item.repositoryId === repository.id)
      return {
        ...repository,
        open: findings.filter((item) => item.status === 'Open').length,
        total: findings.length,
      }
    })
  }, [dashboardFindings])

  const filteredVulnerabilities = useMemo(() => {
    const query = search.trim().toLowerCase()
    return dashboardFindings.filter((item) => {
      const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      const matchesRepository =
        repositoryFilter === 'All repositories' || item.repositoryId === repositoryFilter
      const matchesScanner = scannerFilter === 'All scanners' || item.scanner === scannerFilter
      const repositoryName = repositoryById.get(item.repositoryId)?.name ?? item.repositoryId
      const matchesSearch =
        !query ||
        [item.id, item.cveId ?? '', item.title, item.affectedComponent.name, item.scanner, item.cweId, repositoryName].some((value) =>
          value.toLowerCase().includes(query),
        )
      return matchesSeverity && matchesStatus && matchesRepository && matchesScanner && matchesSearch
    })
  }, [dashboardFindings, repositoryFilter, scannerFilter, search, severityFilter, statusFilter])

  const clearFilters = () => {
    setSeverityFilter('All')
    setStatusFilter('All')
    setScannerFilter('All scanners')
    setDateRange('365')
    setRepositoryFilter('All repositories')
    setSearch('')
  }

  const jumpToSection = (section: string, id: string) => {
    setActiveSection(section)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Sentinel home">
          <span className="brand-mark"><Shield size={19} strokeWidth={2.2} /></span>
          <span className="brand-name">sentinel<span>.</span></span>
        </a>

        <button className="workspace-switcher" type="button">
          <span className="workspace-avatar">N</span>
          <span className="workspace-copy">
            <span className="workspace-label">WORKSPACE</span>
            <span className="workspace-name">Northstar Labs</span>
          </span>
          <ChevronDown size={15} />
        </button>

        <div className="nav-group">
          <p className="nav-label">WORKSPACE</p>
          <nav className="primary-nav" aria-label="Main navigation">
            <button
              className={`nav-item ${activeSection === 'Overview' ? 'active' : ''}`}
              type="button"
              onClick={() => jumpToSection('Overview', 'top')}
            >
              <LayoutDashboard size={17} />
              <span>Overview</span>
            </button>
            <button
              className={`nav-item ${activeSection === 'Findings' ? 'active' : ''}`}
              type="button"
              onClick={() => jumpToSection('Findings', 'findings')}
            >
              <ShieldAlert size={17} />
              <span>Vulnerabilities</span>
              <span className="nav-count">{dashboardFindings.length}</span>
            </button>
            <button
              className={`nav-item ${activeSection === 'Repositories' ? 'active' : ''}`}
              type="button"
              onClick={() => jumpToSection('Repositories', 'repositories')}
            >
              <Code2 size={17} />
              <span>Repositories</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-health">
            <span className="health-icon"><Activity size={16} /></span>
            <span><strong>Mock snapshot loaded</strong><small>Last scan {formatScanAge(latestScan)}</small></span>
            <span className="health-dot" />
          </div>
          <button className="profile-button" type="button">
            <span className="profile-avatar">SO</span>
            <span className="profile-copy"><strong>Security operator</strong><small>Workspace role</small></span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="scan-status"><span className="health-dot" />{scannerCount} scanner sources</span>
            <button className="icon-button notification-button" type="button" aria-label="Notifications">
              <Bell size={17} /><span className="notification-dot" />
            </button>
            <span className="topbar-divider" />
            <button className="help-button" type="button" aria-label="Help"><CircleHelp size={17} /></button>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" />SECURITY CENTER</div>
              <h1>Overview</h1>
              <p className="page-subtitle">Your application security posture, at a glance.</p>
            </div>
            <div className="heading-meta">
              <span className="updated-label"><Clock3 size={14} />Updated {formatScanAge(latestScan)}</span>
              <label className="date-select-label"><select className="date-button" aria-label="Filter by date range" value={dateRange} onChange={(event) => setDateRange(event.target.value as DateRange)}>{Object.entries(dateRangeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={15} /></label>
            </div>
          </section>

          <section className="severity-grid" aria-label="Vulnerability severity summary">
            <article className="severity-card total-card">
              <div className="metric-topline"><span className="metric-icon total-icon"><Shield size={16} /></span><span className="metric-context">ALL SEVERITIES</span></div>
              <div className="metric-value-row"><strong>{formatCount(dashboardFindings.length)}</strong></div>
              <span className="metric-caption">Total findings</span>
              <span className="metric-footnote">{formatCount(openCount)} open · {dateRangeLabels[dateRange].toLowerCase()}</span>
            </article>
            <article className="severity-card critical-card">
              <div className="metric-topline"><span className="metric-icon critical-icon"><ShieldAlert size={16} /></span><span className="metric-context">SEVERITY</span></div>
              <div className="metric-value-row"><strong>{formatCount(severityCounts.Critical)}</strong></div>
              <span className="metric-caption">Critical</span>
              <span className="metric-footnote">{formatCount(severityOpenCounts.Critical)} open</span>
            </article>
            <article className="severity-card high-card">
              <div className="metric-topline"><span className="metric-icon high-icon"><Activity size={16} /></span><span className="metric-context">SEVERITY</span></div>
              <div className="metric-value-row"><strong>{formatCount(severityCounts.High)}</strong></div>
              <span className="metric-caption">High</span>
              <span className="metric-footnote">{formatCount(severityOpenCounts.High)} open</span>
            </article>
            <article className="severity-card moderate-card">
              <div className="metric-topline"><span className="metric-icon medium-icon"><Activity size={16} /></span><span className="metric-context">SEVERITY</span></div>
              <div className="metric-value-row"><strong>{formatCount(severityCounts.Medium)}</strong></div>
              <span className="metric-caption">Medium</span>
              <span className="metric-footnote">{formatCount(severityOpenCounts.Medium)} open</span>
            </article>
            <article className="severity-card low-card">
              <div className="metric-topline"><span className="metric-icon low-icon"><ShieldCheck size={16} /></span><span className="metric-context">SEVERITY</span></div>
              <div className="metric-value-row"><strong>{formatCount(severityCounts.Low)}</strong></div>
              <span className="metric-caption">Low</span>
              <span className="metric-footnote">{formatCount(severityOpenCounts.Low)} open</span>
            </article>
          </section>

          <section className="overview-grid" aria-label="Vulnerability activity">
            <article className="panel trend-panel">
              <div className="panel-heading">
                <div><h2>Vulnerability trends</h2><p>Findings opened and resolved over time</p></div>
                <span className="quiet-button chart-interval">By month</span>
              </div>
              <div className="chart-legend">
                <span><i className="legend-dot opened-dot" />Opened <strong>{formatCount(openedInRange)}</strong></span>
                <span><i className="legend-dot resolved-dot" />Resolved <strong>{formatCount(resolvedInRange)}</strong></span>
                <span className="chart-period">{dateRangeLabels[dateRange].toUpperCase()}</span>
              </div>
              <div className="trend-chart" role="img" aria-label={`Area chart showing findings opened and resolved over ${dateRangeLabels[dateRange].toLowerCase()}`}>
                <Suspense fallback={<div className="chart-loading">Loading chart...</div>}>
                  <TrendChart data={trendData} />
                </Suspense>
              </div>
            </article>

            <article className="panel remediation-panel">
              <div className="panel-heading"><div><h2>Remediation</h2><p>Open vs. resolved findings</p></div><button className="icon-button panel-more" type="button" aria-label="More remediation options">···</button></div>
              <div className="remediation-body">
                <div className="donut-wrap" style={{ '--resolved-percent': `${resolutionPercent}%` } as React.CSSProperties}>
                  <div className="donut-center"><strong>{resolutionPercent}%</strong><span>resolved</span></div>
                </div>
                <div className="status-legend">
                  <div><span className="status-legend-label"><i className="legend-dot opened-dot" />Open</span><strong>{formatCount(openCount)}</strong></div>
                  <div><span className="status-legend-label"><i className="legend-dot resolved-dot" />Resolved</span><strong>{formatCount(resolvedCount)}</strong></div>
                </div>
              </div>
              <div className="remediation-footer"><span><Sparkles size={14} />Resolved in {dateRangeLabels[dateRange].toLowerCase()}</span><strong>{formatCount(resolvedCount)}</strong></div>
            </article>
          </section>

          <section className="lower-grid">
            <article className="panel findings-panel" id="findings">
              <div className="panel-heading findings-heading">
                <div><h2>Recent vulnerabilities</h2><p>Review and prioritize your latest findings</p></div>
                <div className="findings-heading-actions">
                  <button className="calculator-launch" type="button" onClick={() => setIsCalculatorOpen(true)}><Calculator size={14} />CVSS calculator</button>
                  <button className="view-all-button" type="button" onClick={clearFilters}><ListFilter size={15} />Reset filters</button>
                </div>
              </div>
              <div className="table-tools">
                <div className="filter-tabs" role="group" aria-label="Filter by severity">
                  {severityFilters.map((severity) => (
                    <button
                      className={`filter-tab ${severityFilter === severity ? 'selected' : ''} ${severity !== 'All' ? `filter-${severityStyles[severity]}` : ''}`}
                      key={severity}
                      type="button"
                      aria-pressed={severityFilter === severity}
                      onClick={() => setSeverityFilter(severity)}
                    >
                      {severity !== 'All' && <i className="severity-dot" />}{severity}
                    </button>
                  ))}
                </div>
                <div className="table-actions">
                  <label className="search-field"><Search size={15} /><input ref={searchInput} aria-label="Search vulnerabilities" placeholder="Search findings..." value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={14} /></button>}<kbd><Command size={10} /> K</kbd></label>
                  <label className="scanner-select"><Shield size={14} /><select aria-label="Filter by scanner" value={scannerFilter} onChange={(event) => setScannerFilter(event.target.value as ScannerFilter)}><option>All scanners</option>{scannerFilters.map((scanner) => <option key={scanner}>{scanner}</option>)}</select><ChevronDown size={13} /></label>
                  <label className="repository-select"><GitBranch size={14} /><select aria-label="Filter by repository" value={repositoryFilter} onChange={(event) => setRepositoryFilter(event.target.value)}><option value="All repositories">All repositories</option>{repositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.name}</option>)}</select><ChevronDown size={13} /></label>
                </div>
              </div>
              <div className="status-tabs" role="group" aria-label="Filter by status">
                {statusFilters.map((status) => <button className={`status-tab ${statusFilter === status ? 'selected' : ''}`} key={status} type="button" aria-pressed={statusFilter === status} onClick={() => setStatusFilter(status)}>{status}<span>{status === 'All' ? dashboardFindings.length : dashboardFindings.filter((item) => item.status === status).length}</span></button>)}
              </div>
              <div className="table-scroll">
                <table className="vulnerability-table">
                  <thead><tr><th>VULNERABILITY</th><th>SCANNER</th><th>CWE</th><th>SEVERITY</th><th>REPOSITORY</th><th>CVSS</th><th>STATUS</th><th>DETECTED</th><th>RESOLVED</th><th aria-label="Actions" /></tr></thead>
                  <tbody>
                    {filteredVulnerabilities.map((item) => {
                      const repository = repositoryById.get(item.repositoryId)
                      return (
                      <tr key={item.id}>
                        <td><div className="finding-name"><span className="finding-symbol"><ShieldAlert size={15} /></span><span><strong>{item.title}</strong><small>{item.affectedComponent.name}{item.affectedComponent.version && <> <span>@</span> {item.affectedComponent.version}</>}{item.affectedComponent.revision && <> <i>·</i> {item.affectedComponent.revision}</>}{item.affectedComponent.environment && <> <i>·</i> {item.affectedComponent.environment}</>} <i>·</i> {item.cveId ?? item.id}</small></span></div></td>
                        <td><span className={`scanner-badge ${scannerClassName(item.scanner)}`}>{item.scanner}</span></td>
                        <td><span className="cwe-cell">{item.cweId}</span></td>
                        <td><span className={`severity-badge ${severityStyles[item.severity]}`}><i className="severity-dot" />{item.severity}</span></td>
                        <td><span className="repository-cell"><span className={`repo-mark ${repositoryTone(item.repositoryId)}`}>{repository?.name.slice(0, 1).toUpperCase() ?? '?'}</span>{repository?.name ?? item.repositoryId}</span></td>
                        <td><span className={`cvss-score ${severityStyles[item.severity]}`}>{item.cvss.baseScore.toFixed(1)}</span></td>
                        <td><span className={`status-badge ${item.status.toLowerCase()}`}><i />{item.status}</span></td>
                        <td className="detected-date">{formatDate(item.discoveredAt)}</td>
                        <td className="detected-date">{item.resolvedAt ? formatDate(item.resolvedAt) : '—'}</td>
                        <td><button className="row-action" type="button" aria-label={`Open ${item.cveId ?? item.id}`} title={`Open ${item.cveId ?? item.id}`}><ExternalLink size={14} /></button></td>
                      </tr>
                    )})}
                    {filteredVulnerabilities.length === 0 && <tr><td className="empty-state" colSpan={10}><Search size={18} /><strong>No findings match these filters</strong><button type="button" onClick={clearFilters}>Clear filters</button></td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-footer"><span>Showing <strong>{filteredVulnerabilities.length}</strong> of <strong>{dashboardFindings.length}</strong> findings</span><button type="button" className="pagination-button" disabled><span>←</span> Previous</button><button type="button" className="pagination-button pagination-next" disabled>Next <span>→</span></button></div>
            </article>

            <article className="panel repositories-panel" id="repositories">
              <div className="panel-heading"><div><h2>Repositories</h2><p>Security coverage by project</p></div><button className="text-link" type="button" onClick={() => { setRepositoryFilter('All repositories'); jumpToSection('Repositories', 'repositories') }}>View all <ExternalLink size={13} /></button></div>
              <div className="repo-list">
                {repositoryStats.map((repository) => (
                  <button className="repo-item" key={repository.id} type="button" onClick={() => { setRepositoryFilter(repository.id); jumpToSection('Findings', 'findings') }}>
                    <span className={`repo-mark repo-mark-large ${repositoryTone(repository.id)}`}>{repository.name.slice(0, 1).toUpperCase()}</span>
                    <span className="repo-item-main"><strong>{repository.name}</strong><small><span className={`language-dot ${languageTone(repository.primaryLanguage)}`} />{repository.primaryLanguage}<i>·</i>{formatScanAge(repository.lastScannedAt)}</small></span>
                    <span className="repo-item-count"><strong>{formatCount(repository.open)}</strong><small>open</small></span>
                  </button>
                ))}
              </div>
              <div className="coverage-note"><span className="coverage-icon"><ShieldCheck size={15} /></span><span><strong>{repositories.length ? Math.round((scannedRepositoryCount / repositories.length) * 100) : 0}% coverage</strong><small>{scannedRepositoryCount} of {repositories.length} repositories scanned</small></span><span className="coverage-bar"><i style={{ width: `${repositories.length ? (scannedRepositoryCount / repositories.length) * 100 : 0}%` }} /></span></div>
            </article>
          </section>

          <footer className="page-footer"><span>Sentinel Security <i>·</i> Demo workspace</span><span>Data is sample content <i>·</i> No external connections</span></footer>
        </div>
      </main>
      {isCalculatorOpen && (
        <Suspense fallback={<div className="cvss-loading">Loading calculator...</div>}>
          <CvssCalculator onClose={() => setIsCalculatorOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}

export default App