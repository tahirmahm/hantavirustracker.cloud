/**
 * Hantavirus death estimator.
 *
 * Data sourced from WHO, CDC, and peer-reviewed literature.
 * All figures are epidemiological estimates — not exact real-time counts.
 *
 * HPS  = Hantavirus Pulmonary Syndrome      (Americas)  CFR ~36%
 * HFRS = Hemorrhagic Fever with Renal Syndrome (global)  CFR ~1-15% avg ~5%
 */

export interface DeathStats {
  // Historical totals (rough cumulative since surveillance began)
  hpsDeathsHistorical: number       // US + Americas since 1993
  hfrsDeathsHistorical: number      // Global since ~1950s formal surveillance

  // Annual averages (WHO / CDC publications)
  hpsAnnualCases: number
  hpsAnnualDeaths: number
  hfrsAnnualCases: number
  hfrsAnnualDeaths: number

  // Case fatality rates
  hpsCFR: number    // 0.36
  hfrsCFR: number   // 0.05

  // Estimated year-to-date (computed from Jan 1 of current year)
  ytdDeaths: number
  ytdCases: number

  // Live-ish counter base + rate for the ticker
  totalEstimatedDeaths: number   // cumulative all-time estimate
  deathsPerDay: number           // global average
  deathsPerHour: number
  deathsPerSecond: number

  currentYear: number
  dataAsOf: string
}

/** Returns a snapshot of estimated death statistics as of the current moment */
export function getDeathStats(): DeathStats {
  const now = new Date()
  const currentYear = now.getFullYear()

  // ── Historical baselines ────────────────────────────────────────────────
  // HPS: ~850 confirmed US cases 1993-2024, ~36% CFR → ~306 US deaths
  //      Americas (including Chile, Argentina, Brazil, Panama): est. ×2.5 → ~765 total
  const hpsDeathsHistorical = 840

  // HFRS: ~150,000 cases/year globally since 1970s WHO records
  //       Conservative 50yr total: 150k × 50 × 5% CFR = 375,000
  //       Literature suggests 100,000–200,000 cumulative deaths
  const hfrsDeathsHistorical = 140_000

  // ── Annual averages ─────────────────────────────────────────────────────
  const hpsAnnualCases  = 230
  const hpsAnnualDeaths = Math.round(hpsAnnualCases * 0.36)    // ~83

  const hfrsAnnualCases  = 150_000
  const hfrsAnnualDeaths = Math.round(hfrsAnnualCases * 0.05)  // ~7,500

  const totalAnnualDeaths = hpsAnnualDeaths + hfrsAnnualDeaths  // ~7,583

  // ── Year-to-date ─────────────────────────────────────────────────────────
  const startOfYear = new Date(currentYear, 0, 1)
  const dayOfYear   = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000)
  const yearFraction = dayOfYear / 365

  const ytdCases  = Math.round((hpsAnnualCases + hfrsAnnualCases) * yearFraction)
  const ytdDeaths = Math.round(totalAnnualDeaths * yearFraction)

  // ── Live-counter parameters ───────────────────────────────────────────────
  // All-time cumulative: historical + recent years
  const yearsSince2024 = Math.max(0, currentYear - 2024)
  const totalEstimatedDeaths = hpsDeathsHistorical + hfrsDeathsHistorical + yearsSince2024 * totalAnnualDeaths

  const deathsPerDay    = totalAnnualDeaths / 365
  const deathsPerHour   = deathsPerDay / 24
  const deathsPerSecond = deathsPerHour / 3600

  return {
    hpsDeathsHistorical,
    hfrsDeathsHistorical,
    hpsAnnualCases,
    hpsAnnualDeaths,
    hfrsAnnualCases,
    hfrsAnnualDeaths,
    hpsCFR: 0.36,
    hfrsCFR: 0.05,
    ytdDeaths,
    ytdCases,
    totalEstimatedDeaths,
    deathsPerDay:    Math.round(deathsPerDay * 10) / 10,
    deathsPerHour:   Math.round(deathsPerHour * 10) / 10,
    deathsPerSecond: Math.round(deathsPerSecond * 1000) / 1000,
    currentYear,
    dataAsOf: 'WHO/CDC surveillance data',
  }
}

/** Returns a count that ticks in real-time from a base value */
export function getLiveDeathCount(baseCount: number, deathsPerSecond: number, anchorTime: number): number {
  const elapsedSeconds = (Date.now() - anchorTime) / 1000
  return Math.round(baseCount + elapsedSeconds * deathsPerSecond)
}
