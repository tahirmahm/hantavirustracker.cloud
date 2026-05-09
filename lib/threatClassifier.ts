import { resolveLocation, resolveAllLocations } from './geoResolver'

export type ThreatLevel = 'MINIMAL' | 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL'
export type SourceType = 'WHO' | 'CDC' | 'ProMED' | 'ECDC' | 'NewsChannel' | 'PubMed' | 'HealthMap' | 'ReliefWeb'

export interface ThreatSignal {
  id: string
  source: SourceType
  text: string
  title: string
  location?: string
  date: string
  url?: string
}

export interface GeoHotspot {
  country: string
  region?: string
  lat: number
  lng: number
  intensity: number
  caseCount?: number
  signalCount: number
  threatLevel: ThreatLevel
  sources: string[]
  lastSeen: string
  score: number
}

export interface ThreatAssessment {
  globalThreatLevel: ThreatLevel
  threatScore: number
  convergenceScore: number
  hotspots: GeoHotspot[]
  keySignals: string[]
  lastUpdated: string
  signalCount: number
  convergenceEvents: ConvergenceEvent[]
}

export interface ConvergenceEvent {
  location: string
  lat: number
  lng: number
  sourceCount: number
  sources: string[]
  firstSeen: string
  lastSeen: string
}

export interface ScoredItem {
  signal: ThreatSignal
  score: number
  keywords: string[]
  geoLocations: Array<{ country: string; lat: number; lng: number; iso2: string }>
}

const HIGH_WEIGHT_KEYWORDS = [
  'hantavirus', 'hantaan', 'sin nombre', 'puumala', 'andes virus', 'hps',
  'hfrs', 'hemorrhagic fever with renal syndrome', 'hantapulmonary',
  'seoul virus', 'dobrava', 'bayou virus', 'black creek canal',
]

const MEDIUM_WEIGHT_KEYWORDS = [
  'outbreak', 'cluster', 'cases confirmed', 'fatality', 'death', 'epidemic',
  'spread', 'transmission', 'infected', 'infection', 'cases reported',
  'suspected cases', 'laboratory confirmed', 'new cases',
]

const CONTEXTUAL_KEYWORDS = [
  'rodent', 'deer mouse', 'rat', 'muridae', 'sigmodontinae', 'reservoir host',
  'peromyscus', 'vole', 'mouse', 'mice', 'excreta', 'droppings', 'inhalation',
  'pulmonary syndrome', 'renal syndrome', 'zoonotic', 'zoonosis',
]

const AMPLIFIER_KEYWORDS = [
  'warning', 'alert', 'emergency', 'surge', 'rapid increase', 'unprecedented',
  'critical', 'severe', 'deadly', 'lethal', 'mass casualty', 'pandemic risk',
]

const SOURCE_CREDIBILITY: Record<SourceType, number> = {
  WHO: 1.0,
  CDC: 0.95,
  ProMED: 0.9,
  ECDC: 0.85,
  PubMed: 0.8,
  HealthMap: 0.75,
  ReliefWeb: 0.7,
  NewsChannel: 0.7,
}

function getThreatLevel(score: number): ThreatLevel {
  if (score <= 10) return 'MINIMAL'
  if (score <= 25) return 'LOW'
  if (score <= 45) return 'MODERATE'
  if (score <= 65) return 'ELEVATED'
  if (score <= 80) return 'HIGH'
  return 'CRITICAL'
}

function temporalDecay(dateStr: string): number {
  const signalDate = new Date(dateStr)
  if (isNaN(signalDate.getTime())) return 0.5
  const now = Date.now()
  const ageMs = now - signalDate.getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)

  if (ageDays < 1) return 1.5
  if (ageDays <= 7) return 1.0 - (ageDays - 1) * 0.1
  if (ageDays <= 30) return Math.max(0.1, 0.3 - (ageDays - 7) * 0.01)
  return 0.05
}

export function scoreSignal(signal: ThreatSignal): ScoredItem {
  const fullText = `${signal.title} ${signal.text}`.toLowerCase()
  const foundKeywords: string[] = []
  let rawScore = 0

  for (const kw of HIGH_WEIGHT_KEYWORDS) {
    if (fullText.includes(kw)) {
      rawScore += 10
      foundKeywords.push(kw)
    }
  }

  for (const kw of MEDIUM_WEIGHT_KEYWORDS) {
    if (fullText.includes(kw)) {
      rawScore += 5
      foundKeywords.push(kw)
    }
  }

  for (const kw of CONTEXTUAL_KEYWORDS) {
    if (fullText.includes(kw)) {
      rawScore += 3
      foundKeywords.push(kw)
    }
  }

  let amplify = 1.0
  for (const kw of AMPLIFIER_KEYWORDS) {
    if (fullText.includes(kw)) {
      amplify = 2.0
      break
    }
  }

  const credibility = SOURCE_CREDIBILITY[signal.source] ?? 0.5
  const decay = temporalDecay(signal.date)
  const score = Math.min(100, rawScore * amplify * credibility * decay)

  const locationText = `${signal.title} ${signal.text} ${signal.location || ''}`
  const geoLocations = resolveAllLocations(locationText)

  return { signal, score, keywords: [...new Set(foundKeywords)], geoLocations }
}

export function computeThreatAssessment(signals: ThreatSignal[]): ThreatAssessment {
  if (signals.length === 0) {
    return {
      globalThreatLevel: 'MINIMAL',
      threatScore: 0,
      convergenceScore: 0,
      hotspots: [],
      keySignals: [],
      lastUpdated: new Date().toISOString(),
      signalCount: 0,
      convergenceEvents: [],
    }
  }

  const scored = signals.map(scoreSignal)
  const relevant = scored.filter(s => s.score > 0)

  // Aggregate by geography
  const geoMap = new Map<string, {
    score: number
    count: number
    sources: Set<string>
    lat: number
    lng: number
    lastSeen: string
  }>()

  for (const item of relevant) {
    for (const geo of item.geoLocations) {
      const key = geo.iso2
      const existing = geoMap.get(key)
      if (existing) {
        existing.score += item.score
        existing.count++
        existing.sources.add(item.signal.source)
        if (item.signal.date > existing.lastSeen) existing.lastSeen = item.signal.date
      } else {
        geoMap.set(key, {
          score: item.score,
          count: 1,
          sources: new Set([item.signal.source]),
          lat: geo.lat,
          lng: geo.lng,
          lastSeen: item.signal.date,
        })
      }
    }
  }

  // Build hotspots
  const hotspots: GeoHotspot[] = []
  for (const [iso2, data] of geoMap.entries()) {
    const entry = COUNTRY_CENTROIDS_MAP.get(iso2)
    if (!data || !entry) continue
    const normalizedScore = Math.min(100, data.score)
    hotspots.push({
      country: entry.name,
      lat: data.lat,
      lng: data.lng,
      intensity: normalizedScore / 100,
      signalCount: data.count,
      threatLevel: getThreatLevel(normalizedScore),
      sources: [...data.sources],
      lastSeen: data.lastSeen,
      score: normalizedScore,
    })
  }
  hotspots.sort((a, b) => b.score - a.score)

  // Convergence: 3+ independent sources on same location within 72h
  const convergenceEvents: ConvergenceEvent[] = []
  const now = Date.now()
  const window72h = 72 * 60 * 60 * 1000

  for (const [iso2, data] of geoMap.entries()) {
    const entry = COUNTRY_CENTROIDS_MAP.get(iso2)
    if (!entry) continue
    const recentSignals = relevant.filter(s =>
      s.geoLocations.some(g => g.iso2 === iso2) &&
      now - new Date(s.signal.date).getTime() < window72h
    )
    const recentSources = new Set(recentSignals.map(s => s.signal.source))
    if (recentSources.size >= 3) {
      const dates = recentSignals.map(s => s.signal.date).sort()
      convergenceEvents.push({
        location: entry.name,
        lat: entry.lat,
        lng: entry.lng,
        sourceCount: recentSources.size,
        sources: [...recentSources],
        firstSeen: dates[0] || new Date().toISOString(),
        lastSeen: dates[dates.length - 1] || new Date().toISOString(),
      })
    }
  }

  // Compute global threat score
  let globalScore = 0
  if (relevant.length > 0) {
    const topScores = relevant
      .map(s => s.score)
      .sort((a, b) => b - a)
      .slice(0, 10)
    globalScore = topScores.reduce((sum, s) => sum + s, 0) / topScores.length

    // Convergence boost: +30% if any convergence events
    if (convergenceEvents.length > 0) {
      globalScore = Math.min(100, globalScore * 1.3)
    }
  }

  // Key signals: top 5 unique headlines
  const keySignals = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.signal.title)
    .filter(Boolean)

  return {
    globalThreatLevel: getThreatLevel(globalScore),
    threatScore: Math.round(globalScore),
    convergenceScore: Math.min(100, convergenceEvents.length * 33),
    hotspots: hotspots.slice(0, 20),
    keySignals,
    lastUpdated: new Date().toISOString(),
    signalCount: relevant.length,
    convergenceEvents,
  }
}

// Pre-build a map for fast lookups
import { COUNTRY_CENTROIDS } from './geoResolver'
const COUNTRY_CENTROIDS_MAP = new Map(COUNTRY_CENTROIDS.map(c => [c.iso2, c]))

export function getThreatColor(level: ThreatLevel): string {
  switch (level) {
    case 'MINIMAL': return '#00ff88'
    case 'LOW': return '#00d4ff'
    case 'MODERATE': return '#f0c040'
    case 'ELEVATED': return '#ff6b00'
    case 'HIGH': return '#ff2040'
    case 'CRITICAL': return '#cc0020'
  }
}

export function getThreatGlowClass(level: ThreatLevel): string {
  switch (level) {
    case 'MINIMAL': return 'threat-glow-minimal'
    case 'LOW': return 'threat-glow-low'
    case 'MODERATE': return 'threat-glow-moderate'
    case 'ELEVATED': return 'threat-glow-elevated'
    case 'HIGH': return 'threat-glow-high'
    case 'CRITICAL': return 'threat-glow-critical'
  }
}
