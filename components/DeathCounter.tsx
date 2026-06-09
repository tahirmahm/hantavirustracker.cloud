'use client'

import { useState, useEffect, useRef } from 'react'
import { getDeathStats, getLiveDeathCount } from '@/lib/deathEstimator'

const ANCHOR = Date.now()
const STATS   = getDeathStats()

function useTickingCount(base: number, perSecond: number) {
  const [count, setCount] = useState(base)
  useEffect(() => {
    if (perSecond < 0.001) return
    const interval = setInterval(
      () => setCount(getLiveDeathCount(base, perSecond, ANCHOR)),
      perSecond > 0.1 ? 100 : 1000
    )
    return () => clearInterval(interval)
  }, [base, perSecond])
  return count
}

function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const start = prev.current
    const t0 = Date.now()
    const raf = () => {
      const p = Math.min(1, (Date.now() - t0) / duration)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(start + (target - start) * e))
      if (p < 1) requestAnimationFrame(raf)
      else prev.current = target
    }
    requestAnimationFrame(raf)
  }, [target, duration])
  return <>{display.toLocaleString()}</>
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="py-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
      <div className="caption-up mb-1" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="font-display" style={{ fontSize: '28px', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--muted-soft)', marginTop: '2px', fontFamily: 'var(--font-body)' }}>{sub}</div>}
    </div>
  )
}

export default function DeathCounter() {
  const ytdLive = useTickingCount(STATS.ytdDeaths, STATS.deathsPerSecond)

  return (
    <div className="card relative overflow-hidden h-full flex flex-col" style={{ padding: '20px 20px 16px' }}>
      {/* Atmospheric orb — rose tint for mortality data */}
      <div
        className="orb"
        style={{
          width: '220px', height: '220px',
          background: `radial-gradient(circle, var(--orb-rose) 0%, transparent 70%)`,
          top: '-60px', right: '-60px',
          opacity: 0.35,
        }}
      />

      {/* Header */}
      <div className="caption-up mb-4" style={{ color: 'var(--muted)' }}>
        Estimated Fatalities
      </div>

      {/* Hero number — YTD deaths */}
      <div className="mb-1">
        <div
          className="font-display"
          style={{ fontSize: '56px', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--ink)' }}
        >
          {ytdLive.toLocaleString()}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-body)' }}>
          estimated deaths in {STATS.currentYear}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--hairline)', margin: '16px 0' }} />

      {/* Stats grid */}
      <div className="flex-1 space-y-0">
        <Stat
          label="HPS Case Fatality Rate"
          value={`${(STATS.hpsCFR * 100).toFixed(0)}%`}
          sub={`Hantavirus Pulmonary Syndrome · Americas`}
        />
        <Stat
          label="HFRS Case Fatality Rate"
          value={`${(STATS.hfrsCFR * 100).toFixed(0)}%`}
          sub="Hemorrhagic Fever w/ Renal Syndrome · Global"
        />
        <Stat
          label="Global Annual Cases"
          value={<AnimatedNumber target={STATS.hpsAnnualCases + STATS.hfrsAnnualCases} />}
          sub="WHO/CDC estimated average per year"
        />
        <div className="py-3">
          <div className="caption-up mb-1" style={{ color: 'var(--muted)' }}>Cumulative Deaths (all-time est.)</div>
          <div className="font-display" style={{ fontSize: '28px', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            <AnimatedNumber target={STATS.hpsDeathsHistorical + STATS.hfrsDeathsHistorical} duration={1600} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted-soft)', marginTop: '2px', fontFamily: 'var(--font-body)' }}>
            HPS + HFRS since formal surveillance began
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div
        style={{
          fontSize: '10px',
          color: 'var(--muted-soft)',
          fontFamily: 'var(--font-body)',
          borderTop: '1px solid var(--hairline)',
          paddingTop: '10px',
          marginTop: '8px',
          lineHeight: 1.5,
        }}
      >
        Epidemiological estimates. Sources: {STATS.dataAsOf}.
        Not a substitute for official health authority reports.
      </div>
    </div>
  )
}
