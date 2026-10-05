import { CVSS31 } from '@pandatix/js-cvss'

export type Cvss31MetricKey = 'AV' | 'AC' | 'PR' | 'UI' | 'S' | 'C' | 'I' | 'A'
export type Cvss31Metrics = Record<Cvss31MetricKey, string>

export const defaultCvss31Metrics: Cvss31Metrics = {
  AV: 'N',
  AC: 'L',
  PR: 'N',
  UI: 'N',
  S: 'U',
  C: 'H',
  I: 'H',
  A: 'H',
}

const metricOrder: Cvss31MetricKey[] = ['AV', 'AC', 'PR', 'UI', 'S', 'C', 'I', 'A']

export function buildCvss31Vector(metrics: Cvss31Metrics): string {
  return `CVSS:3.1/${metricOrder.map((key) => `${key}:${metrics[key]}`).join('/')}`
}

export function calculateCvss31(metrics: Cvss31Metrics) {
  const vector = buildCvss31Vector(metrics)
  const score = new CVSS31(vector).BaseScore()
  const rating = CVSS31.Rating(score)
  return { vector, score, rating }
}