'use client'

import { useEffect, useState, useRef } from 'react'
import type { ThreatAssessment, GeoHotspot } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'
import type { SourceStatus } from '@/hooks/useDataRefresh'
import { formatDistanceToNow } from 'date-fns'

interface MetricsPanelProps {
  assessment: ThreatAssessment | null
  sourceStatuses: SourceStatus[]
  hourlyActivity: number[]
  onHotspotSelect?: (hotspot: GeoHotspot) => void
  isLoading: boolean
  /** fluid=true removes the fixed 264px width and flush border overrides */
  fluid?: boolean
}

function AnimatedNumber({ target }: { target: number }) {
  const [d, setD] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const s = prev.current, t0 = Date.now()
    const raf = () => {
      const p = Math.min(1, (Date.now() - t0) / 700)
      const e = 1 - Math.pow(1 - p, 3)
      setD(Math.round(s + (target - s) * e))
      if (p < 1) requestAnimationFrame(raf)
      else prev.current = target
    }
    requestAnimationFrame(raf)
  }, [target])
  return <>{d}</>
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const w = 220, h = 32
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 2) - 1}`).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function StatusDot({ status }: { status: SourceStatus['status'] }) {
  const color =
    status === 'live'    ? 'var(--sem-success)' :
    status === 'loading' ? '#2563eb' :
    status === 'stale'   ? 'var(--threat-moderate)' :
    status === 'error'   ? 'var(--sem-error)' : 'var(--muted-soft)'
  return (
    <span
      className={status === 'live' ? 'pulse' : ''}
      style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }}
    />
  )
}

function threatBadgeClass(level: string) {
  const m: Record<string, string> = {
    MINIMAL: 'badge-minimal', LOW: 'badge-low', MODERATE: 'badge-moderate',
    ELEVATED: 'badge-elevated', HIGH: 'badge-high', CRITICAL: 'badge-critical',
  }
  return m[level] ?? 'badge'
}

export default function MetricsPanel({ assessment, sourceStatuses, hourlyActivity, onHotspotSelect, isLoading, fluid }: MetricsPanelProps) {
  const level  = assessment?.globalThreatLevel ?? 'MINIMAL'
  const score  = assessment?.threatScore ?? 0
  const color  = getThreatColor(level)

  return (
    <div
      className="card flex flex-col h-full overflow-hidden"
      style={fluid ? { flexShrink: 0 } : { width: '264px', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', flexShrink: 0 }}
    >
      {/* Hero: threat score */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
        {/* Orb decoration */}
        <div style={{ position: 'relative' }}>
          <div
            className="orb"
            style={{ width: '160px', height: '160px', background: `radial-gradient(circle, var(--orb-sky) 0%, transparent 70%)`, top: '-40px', right: '-40px', opacity: 0.4 }}
          />
        </div>

        <div className="caption-up mb-3">Threat Assessment</div>

        <div className="flex items-end gap-2 mb-2">
          <div
            className="font-display"
            style={{ fontSize: '64px', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.04em', color }}
          >
            {isLoading ? <span className="skeleton inline-block" style={{ width: '80px', height: '60px' }} /> : <AnimatedNumber target={score} />}
          </div>
          <div className="mb-2">
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-body)', marginBottom: '4px' }}>/ 100</div>
          </div>
        </div>

        <span className={`badge ${threatBadgeClass(level)}`}>{level}</span>

        {/* Progress bar */}
        <div style={{ marginTop: '12px', height: '3px', background: 'var(--hairline)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2" style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--canvas-soft)' }}>
        {[
          { label: 'Hotspots', value: assessment?.hotspots.length ?? 0 },
          { label: 'Signals', value: assessment?.signalCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="px-4 py-3" style={{ borderRight: label === 'Hotspots' ? '1px solid var(--hairline)' : undefined }}>
            <div className="caption-up mb-1">{label}</div>
            <div className="font-display" style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <div className="caption-up mb-2">24h Signal Activity</div>
        <Sparkline data={hourlyActivity} />
      </div>

      {/* Sources */}
      <div style={{ borderBottom: '1px solid var(--hairline)' }}>
        <div className="caption-up px-5 py-2.5">Intelligence Sources</div>
        {sourceStatuses.map(src => {
          let ts = ''
          if (src.lastFetch) {
            try { ts = formatDistanceToNow(new Date(src.lastFetch), { addSuffix: true }) } catch { /* */ }
          }
          return (
            <div
              key={src.key}
              className="flex items-center gap-2.5 px-5 py-1.5"
              style={{ transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-strong)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <StatusDot status={src.status} />
              <span className="flex-1 truncate" style={{ fontSize: '13px', color: 'var(--body)', fontFamily: 'var(--font-body)' }}>{src.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--muted-soft)', fontFamily: 'var(--font-mono)' }}>
                {ts || (src.status === 'loading' ? 'fetching…' : '—')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Hotspot rankings */}
      {assessment && assessment.hotspots.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="caption-up px-5 py-2.5">Top Regions</div>
          {assessment.hotspots.slice(0, 6).map((hs, i) => {
            const c = getThreatColor(hs.threatLevel)
            return (
              <button
                key={hs.country}
                className="w-full text-left px-5 py-2 flex items-center gap-2"
                style={{ transition: 'background 0.1s', borderBottom: '1px solid var(--hairline-soft)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-strong)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                onClick={() => onHotspotSelect?.(hs)}
              >
                <span style={{ fontSize: '11px', color: 'var(--muted-soft)', minWidth: '14px', fontFamily: 'var(--font-mono)' }}>{i + 1}</span>
                <span className="flex-1 truncate" style={{ fontSize: '13px', color: 'var(--body)', fontFamily: 'var(--font-body)' }}>{hs.country}</span>
                <div style={{ width: '36px', height: '2px', background: 'var(--hairline)', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${hs.intensity * 100}%`, background: c }} />
                </div>
                <span style={{ fontSize: '12px', color: c, minWidth: '24px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(hs.score)}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-2 shrink-0" style={{ borderTop: '1px solid var(--hairline)', background: 'var(--canvas-soft)' }}>
        <span style={{ fontSize: '11px', color: 'var(--muted-soft)', fontFamily: 'var(--font-body)' }}>
          Updated {assessment ? new Date(assessment.lastUpdated).toLocaleTimeString() : '—'}
        </span>
      </div>
    </div>
  )
}
