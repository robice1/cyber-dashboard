import { useEffect, useState } from 'react'
import { Calculator, Copy, RotateCcw, X } from 'lucide-react'
import {
  calculateCvss31,
  defaultCvss31Metrics,
  type Cvss31MetricKey,
  type Cvss31Metrics,
} from '../lib/cvss31'
import './CvssCalculator.css'

type MetricOption = { value: string; label: string }
type MetricDefinition = {
  key: Cvss31MetricKey
  label: string
  description: string
  options: MetricOption[]
}

const options = {
  attackVector: [
    { value: 'N', label: 'Network' },
    { value: 'A', label: 'Adjacent' },
    { value: 'L', label: 'Local' },
    { value: 'P', label: 'Physical' },
  ],
  lowHigh: [
    { value: 'L', label: 'Low' },
    { value: 'H', label: 'High' },
  ],
  privileges: [
    { value: 'N', label: 'None' },
    { value: 'L', label: 'Low' },
    { value: 'H', label: 'High' },
  ],
  userInteraction: [
    { value: 'N', label: 'None' },
    { value: 'R', label: 'Required' },
  ],
  scope: [
    { value: 'U', label: 'Unchanged' },
    { value: 'C', label: 'Changed' },
  ],
  impact: [
    { value: 'N', label: 'None' },
    { value: 'L', label: 'Low' },
    { value: 'H', label: 'High' },
  ],
} satisfies Record<string, MetricOption[]>

const exploitabilityMetrics: MetricDefinition[] = [
  { key: 'AV', label: 'Attack vector', description: 'How the vulnerability is reached', options: options.attackVector },
  { key: 'AC', label: 'Attack complexity', description: 'Conditions beyond the attacker', options: options.lowHigh },
  { key: 'PR', label: 'Privileges required', description: 'Access needed before exploitation', options: options.privileges },
  { key: 'UI', label: 'User interaction', description: 'Whether another user must act', options: options.userInteraction },
]

const impactMetrics: MetricDefinition[] = [
  { key: 'S', label: 'Scope', description: 'Whether impact crosses a security authority', options: options.scope },
  { key: 'C', label: 'Confidentiality', description: 'Impact to information disclosure', options: options.impact },
  { key: 'I', label: 'Integrity', description: 'Impact to information trustworthiness', options: options.impact },
  { key: 'A', label: 'Availability', description: 'Impact to service availability', options: options.impact },
]

function CvssCalculator({ onClose }: { onClose: () => void }) {
  const [metrics, setMetrics] = useState<Cvss31Metrics>(defaultCvss31Metrics)
  const [copyStatus, setCopyStatus] = useState<'copied' | 'failed' | ''>('')

  const { vector, score, rating } = calculateCvss31(metrics)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const updateMetric = (key: Cvss31MetricKey, value: string) => {
    setMetrics((current) => ({ ...current, [key]: value }))
    setCopyStatus('')
  }

  const copyVector = async () => {
    let succeeded = false
    try {
      await navigator.clipboard.writeText(vector)
      succeeded = true
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = vector
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        succeeded = document.execCommand('copy')
      } catch {
        succeeded = false
      }
      textarea.remove()
    }
    setCopyStatus(succeeded ? 'copied' : 'failed')
  }

  const renderMetric = ({ key, label, description, options: metricOptions }: MetricDefinition) => (
    <label className="cvss-metric" key={key}>
      <span className="cvss-metric-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <select aria-label={label} value={metrics[key]} onChange={(event) => updateMetric(key, event.target.value)}>
        {metricOptions.map((option) => <option key={option.value} value={option.value}>{option.label} ({option.value})</option>)}
      </select>
    </label>
  )

  return (
    <div className="cvss-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="cvss-dialog" role="dialog" aria-modal="true" aria-labelledby="cvss-title">
        <header className="cvss-dialog-header">
          <div className="cvss-dialog-icon"><Calculator size={17} /></div>
          <div className="cvss-dialog-title"><h2 id="cvss-title">CVSS calculator</h2><p>Base score <span>·</span> Version 3.1</p></div>
          <button className="cvss-icon-button" type="button" aria-label="Close CVSS calculator" onClick={onClose}><X size={17} /></button>
        </header>

        <div className="cvss-dialog-content">
          <div className="cvss-metric-groups">
            <section className="cvss-metric-group" aria-labelledby="cvss-exploitability-title">
              <div className="cvss-group-heading"><h3 id="cvss-exploitability-title">Exploitability</h3><span>4 METRICS</span></div>
              <div className="cvss-metric-list">{exploitabilityMetrics.map(renderMetric)}</div>
            </section>
            <section className="cvss-metric-group" aria-labelledby="cvss-impact-title">
              <div className="cvss-group-heading"><h3 id="cvss-impact-title">Impact</h3><span>4 METRICS</span></div>
              <div className="cvss-metric-list">{impactMetrics.map(renderMetric)}</div>
            </section>
          </div>

          <section className="cvss-result" aria-live="polite" aria-label="Calculated CVSS result">
            <div className="cvss-score-display"><strong>{score.toFixed(1)}</strong><span>BASE SCORE</span></div>
            <div className="cvss-result-detail"><span className={`cvss-rating ${rating}`}>{rating}</span><span>CVSS v3.1</span></div>
            <div className="cvss-vector-row"><span className="cvss-vector-label">VECTOR</span><code>{vector}</code><button className="cvss-copy-button" type="button" onClick={copyVector} aria-label="Copy CVSS vector" title="Copy vector"><Copy size={14} /></button><span className="cvss-copy-status" aria-live="polite">{copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Failed' : ''}</span></div>
          </section>
        </div>

        <footer className="cvss-dialog-footer">
          <span>FIRST CVSS v3.1 base metric scoring</span>
          <button className="cvss-reset-button" type="button" onClick={() => { setMetrics(defaultCvss31Metrics); setCopyStatus('') }}><RotateCcw size={14} />Reset metrics</button>
        </footer>
      </section>
    </div>
  )
}

export default CvssCalculator