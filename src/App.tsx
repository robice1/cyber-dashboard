import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
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
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import {
  repositories,
  trendData,
  vulnerabilities,
  type Severity,
  type Vulnerability,
} from './data/mockData'
import './App.css'

const TrendChart = lazy(() => import('./components/TrendChart'))
const CvssCalculator = lazy(() => import('./components/CvssCalculator'))

type SeverityFilter = Severity | 'All'
type StatusFilter = Vulnerability['status'] | 'All'

const severityFilters: SeverityFilter[] = ['All', 'Critical', 'High', 'Medium', 'Low']
const statusFilters: StatusFilter[] = ['All', 'Open', 'Resolved']

const severityStyles: Record<Severity, string> = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
}

const formatCount = (value: number) => value.toString().padStart(2, '0')

function App() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
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

  const severityCounts = useMemo(() => {
    return vulnerabilities.reduce<Record<Severity, number>>(
      (counts, vulnerability) => {
        counts[vulnerability.severity] += 1
        return counts
      },
      { Critical: 0, High: 0, Medium: 0, Low: 0 },
    )
  }, [])

  const openCount = vulnerabilities.filter((item) => item.status === 'Open').length
  const resolvedCount = vulnerabilities.length - openCount
  const resolutionPercent = Math.round((resolvedCount / vulnerabilities.length) * 100)

  const repositoryStats = useMemo(() => {
    return repositories.map((repository) => {
      const findings = vulnerabilities.filter((item) => item.repository === repository.name)
      return {
        ...repository,
        open: findings.filter((item) => item.status === 'Open').length,
        total: findings.length,
      }
    })
  }, [])

  const filteredVulnerabilities = useMemo(() => {
    const query = search.trim().toLowerCase()
    return vulnerabilities.filter((item) => {
      const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      const matchesRepository =
        repositoryFilter === 'All repositories' || item.repository === repositoryFilter
      const matchesSearch =
        !query ||
        [item.id, item.title, item.packageName, item.repository].some((value) =>
          value.toLowerCase().includes(query),
        )
      return matchesSeverity && matchesStatus && matchesRepository && matchesSearch
    })
  }, [repositoryFilter, search, severityFilter, statusFilter])

  const clearFilters = () => {
    setSeverityFilter('All')
    setStatusFilter('All')
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
              <span className="nav-count">{vulnerabilities.length}</span>
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
            <span><strong>All systems healthy</strong><small>Last scan 12 min ago</small></span>
            <span className="health-dot" />
          </div>
          <button className="profile-button" type="button">
            <span className="profile-avatar">AM</span>
            <span className="profile-copy"><strong>Alex Morgan</strong><small>Security lead</small></span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="scan-status"><span className="health-dot" />Scanning active</span>
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
              <span className="updated-label"><Clock3 size={14} />Updated just now</span>
              <button className="date-button" type="button"><span>Last 30 days</span><ChevronDown size={15} /></button>
            </div>
          </section>

          <section className="severity-grid" aria-label="Vulnerability severity summary">
            <article className="severity-card total-card">
              <div className="metric-topline"><span className="metric-icon total-icon"><Shield size={16} /></span><span className="metric-context">ALL SEVERITIES</span></div>
              <div className="metric-value-row"><strong>{formatCount(vulnerabilities.length)}</strong><span className="metric-delta negative"><ArrowUpRight size={14} />12%</span></div>
              <span className="metric-caption">Total findings</span>
              <span className="metric-footnote">vs. previous 30 days</span>
            </article>
            <article className="severity-card critical-card">
              <div className="metric-topline"><span className="metric-icon critical-icon"><ShieldAlert size={16} /></span><span className="metric-context">SEVERITY</span></div>
              <div className="metric-value-row"><strong>{formatCount(severityCounts.Critical)}</strong><span className="metric-delta negative"><ArrowUpRight size={14} />2</span></div>
              <span className="metric-caption">Critical</span>
              <span className="metric-footnote">Immediate attention</span>
            </article>
            <article className="severity-card high-card">
              <div className="metric-topline"><span className="metric-icon high-icon"><Activity size={16} /></span><span className="metric-context">SEVERITY</span></div>
              <div className="metric-value-row"><strong>{formatCount(severityCounts.High)}</strong><span className="metric-delta negative"><ArrowUpRight size={14} />1</span></div>
              <span className="metric-caption">High</span>
              <span className="metric-footnote">Fix within 7 days</span>
            </article>
            <article className="severity-card moderate-card">
              <div className="metric-topline"><span className="metric-icon medium-icon"><Activity size={16} /></span><span className="metric-context">SEVERITY</span></div>
              <div className="metric-value-row"><strong>{formatCount(severityCounts.Medium)}</strong><span className="metric-delta positive"><ArrowDownRight size={14} />4</span></div>
              <span className="metric-caption">Medium</span>
              <span className="metric-footnote">Trending down</span>
            </article>
            <article className="severity-card low-card">
              <div className="metric-topline"><span className="metric-icon low-icon"><ShieldCheck size={16} /></span><span className="metric-context">SEVERITY</span></div>
              <div className="metric-value-row"><strong>{formatCount(severityCounts.Low)}</strong><span className="metric-delta positive"><ArrowDownRight size={14} />3</span></div>
              <span className="metric-caption">Low</span>
              <span className="metric-footnote">Trending down</span>
            </article>
          </section>

          <section className="overview-grid" aria-label="Vulnerability activity">
            <article className="panel trend-panel">
              <div className="panel-heading">
                <div><h2>Vulnerability trends</h2><p>Findings opened and resolved over time</p></div>
                <button className="quiet-button" type="button"><SlidersHorizontal size={15} /><span>Monthly</span><ChevronDown size={14} /></button>
              </div>
              <div className="chart-legend">
                <span><i className="legend-dot opened-dot" />Opened <strong>22</strong></span>
                <span><i className="legend-dot resolved-dot" />Resolved <strong>31</strong></span>
                <span className="chart-period">JUL — OCT 2026</span>
              </div>
              <div className="trend-chart" role="img" aria-label="Area chart showing opened and resolved vulnerabilities from July through October 2026">
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
              <div className="remediation-footer"><span><Sparkles size={14} />Nice work, resolution is up</span><strong>8% <ArrowUpRight size={13} /></strong></div>
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
                  <label className="repository-select"><GitBranch size={14} /><select aria-label="Filter by repository" value={repositoryFilter} onChange={(event) => setRepositoryFilter(event.target.value)}><option>All repositories</option>{repositories.map((repository) => <option key={repository.name}>{repository.name}</option>)}</select><ChevronDown size={13} /></label>
                </div>
              </div>
              <div className="status-tabs" role="group" aria-label="Filter by status">
                {statusFilters.map((status) => <button className={`status-tab ${statusFilter === status ? 'selected' : ''}`} key={status} type="button" aria-pressed={statusFilter === status} onClick={() => setStatusFilter(status)}>{status}<span>{status === 'All' ? vulnerabilities.length : vulnerabilities.filter((item) => item.status === status).length}</span></button>)}
              </div>
              <div className="table-scroll">
                <table className="vulnerability-table">
                  <thead><tr><th>VULNERABILITY</th><th>SEVERITY</th><th>REPOSITORY</th><th>CVSS</th><th>STATUS</th><th>DETECTED</th><th aria-label="Actions" /></tr></thead>
                  <tbody>
                    {filteredVulnerabilities.map((item) => (
                      <tr key={item.id}>
                        <td><div className="finding-name"><span className="finding-symbol"><ShieldAlert size={15} /></span><span><strong>{item.title}</strong><small>{item.packageName} <span>@</span> {item.version} <i>·</i> {item.id}</small></span></div></td>
                        <td><span className={`severity-badge ${severityStyles[item.severity]}`}><i className="severity-dot" />{item.severity}</span></td>
                        <td><span className="repository-cell"><span className={`repo-mark ${item.repoTone}`}>{item.repoInitial}</span>{item.repository}</span></td>
                        <td><span className={`cvss-score ${severityStyles[item.severity]}`}>{item.cvss.toFixed(1)}</span></td>
                        <td><span className={`status-badge ${item.status.toLowerCase()}`}><i />{item.status}</span></td>
                        <td className="detected-date">{item.discovered}</td>
                        <td><button className="row-action" type="button" aria-label={`Open ${item.id}`} title={`Open ${item.id}`}><ExternalLink size={14} /></button></td>
                      </tr>
                    ))}
                    {filteredVulnerabilities.length === 0 && <tr><td className="empty-state" colSpan={7}><Search size={18} /><strong>No findings match these filters</strong><button type="button" onClick={clearFilters}>Clear filters</button></td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-footer"><span>Showing <strong>{filteredVulnerabilities.length}</strong> of <strong>{vulnerabilities.length}</strong> findings</span><button type="button" className="pagination-button" disabled><span>←</span> Previous</button><button type="button" className="pagination-button pagination-next" disabled>Next <span>→</span></button></div>
            </article>

            <article className="panel repositories-panel" id="repositories">
              <div className="panel-heading"><div><h2>Repositories</h2><p>Security coverage by project</p></div><button className="text-link" type="button" onClick={() => { setRepositoryFilter('All repositories'); jumpToSection('Repositories', 'repositories') }}>View all <ExternalLink size={13} /></button></div>
              <div className="repo-list">
                {repositoryStats.map((repository) => (
                  <button className="repo-item" key={repository.name} type="button" onClick={() => { setRepositoryFilter(repository.name); jumpToSection('Findings', 'findings') }}>
                    <span className={`repo-mark repo-mark-large ${repository.tone}`}>{repository.initial}</span>
                    <span className="repo-item-main"><strong>{repository.name}</strong><small><span className={`language-dot ${repository.languageTone}`} />{repository.language}<i>·</i>{repository.updated}</small></span>
                    <span className="repo-item-count"><strong>{formatCount(repository.open)}</strong><small>open</small></span>
                  </button>
                ))}
              </div>
              <div className="coverage-note"><span className="coverage-icon"><ShieldCheck size={15} /></span><span><strong>100% coverage</strong><small>All repositories scanned</small></span><span className="coverage-bar"><i /></span></div>
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