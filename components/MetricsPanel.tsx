'use client'

import { useEffect, useState, useRef } from 'react'
import type { ThreatAssessment, GeoHotspot } from '@/lib/threatClassifier'
import { getThreatColor, getThreatGlowClass } from '@/lib/threatClassifier'
import type { SourceStatus } from '@/hooks/useDataRefresh'
import { formatDistanceToNow } from 'date-fns'
import ThreatMatrix from './ThreatMatrix'

interface MetricsPanelProps {
  assessment: ThreatAssessment | null
  sourceStatuses: SourceStatus[]
  hourlyActivity: number[]
  onHotspotSelect?: (hotspot: GeoHotspot) => void
  isLoading: boolean
}

function AnimatedScore({ target }: { target: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)
  useEffect(() => {
    const start = prevRef.current
    const startTime = Date.now()
    const animate = () => {
      const p = Math.min(1, (Date.now() - startTime) / 700)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(start + (target - start) * eased))
      if (p < 1) requestAnimationFrame(animate)
      else prevRef.current = target
    }
    requestAnimationFrame(animate)
  }, [target])
  return <>{display}</>
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const w = 224, h = 28
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.8" />
    </svg>
  )
}

function StatusDot({ status }: { status: SourceStatus['status'] }) {
  const color =
    status === 'live' ? 'var(--threat-minimal)' :
    status === 'loading' ? 'var(--accent-blue)' :
    status === 'stale' ? 'var(--threat-moderate)' :
    status === 'error' ? 'var(--threat-high)' : 'var(--text-muted)'
  return (
    <span
      className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${status === 'live' ? 'dot-live' : ''}`}
      style={{ background: color }}
    />
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label px-3 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
      {children}
    </div>
  )
}

export default function MetricsPanel({ assessment, sourceStatuses, hourlyActivity, onHotspotSelect, isLoading }: MetricsPanelProps) {
  const level = assessment?.globalThreatLevel ?? 'MINIMAL'
  const score = assessment?.threatScore ?? 0
  const threatColor = getThreatColor(level)

  return (
    <div
      className="panel flex flex-col h-full overflow-hidden"
      style={{ width: '268px', borderRight: '1px solid var(--border)' }}
    >
      {/* Threat score block */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="section-label mb-2">Global Threat Score</div>
        <div className="flex items-end gap-3">
          <div
            className={`font-display font-black leading-none ${getThreatGlowClass(level)}`}
            style={{ fontSize: '52px', letterSpacing: '-0.02em' }}
          >
            {isLoading ? <span className="skeleton inline-block" style={{ width: '72px', height: '52px' }} /> : <AnimatedScore target={score} />}
          </div>
          <div className="mb-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full dot-live" style={{ background: threatColor }} />
              <span className="font-ui font-semibold text-xs" style={{ color: threatColor, letterSpacing: '0.06em' }}>
                {level}
              </span>
            </div>
            <div className="font-terminal text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
              {assessment?.signalCount ?? 0} signals · {assessment?.hotspots.length ?? 0} hotspots
            </div>
          </div>
        </div>

        {/* Inline threat bar */}
        <ThreatMatrix assessment={assessment} compact />
      </div>

      {/* Sparkline */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="section-label mb-2">24h Signal Activity</div>
        <Sparkline data={hourlyActivity} />
      </div>

      {/* Source statuses */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <SectionHeader>Intelligence Sources</SectionHeader>
        <div className="py-1">
          {sourceStatuses.map(src => (
            <div key={src.key} className="flex items-center gap-2 px-3 py-1 hover:bg-[var(--bg-row-hover)]">
              <StatusDot status={src.status} />
              <span className="flex-1 font-terminal text-xs truncate" style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
                {src.name}
              </span>
              <span className="font-terminal shrink-0" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {src.lastFetch
                  ? (() => { try { return formatDistanceToNow(new Date(src.lastFetch), { addSuffix: true }) } catch { return '' } })()
                  : src.status === 'loading' ? 'fetching…' : '—'
                }
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top hotspots */}
      {assessment && assessment.hotspots.length > 0 && (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <SectionHeader>Top Hotspots</SectionHeader>
          <div className="py-1">
            {assessment.hotspots.slice(0, 6).map((hs, i) => {
              const color = getThreatColor(hs.threatLevel)
              return (
                <button
                  key={hs.country}
                  className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-row-hover)] flex items-center gap-2"
                  onClick={() => onHotspotSelect?.(hs)}
                >
                  <span className="font-terminal text-xs w-4 shrink-0" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <span className="flex-1 font-terminal text-xs truncate" style={{ color: 'var(--text-primary)', fontSize: '11px' }}>{hs.country}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div style={{ width: '40px', height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${hs.intensity * 100}%`, background: color, borderRadius: '1px' }} />
                    </div>
                    <span className="font-terminal" style={{ fontSize: '10px', color, minWidth: '24px', textAlign: 'right' }}>
                      {Math.round(hs.score)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Convergence events */}
      {assessment && assessment.convergenceEvents.length > 0 && (
        <div className="flex-1">
          <SectionHeader>Convergence Events</SectionHeader>
          <div className="p-3 space-y-2">
            {assessment.convergenceEvents.map(e => (
              <div
                key={e.location}
                className="p-2 rounded text-xs"
                style={{ background: 'rgba(224,123,57,0.08)', border: '1px solid rgba(224,123,57,0.2)' }}
              >
                <div className="font-ui font-semibold mb-0.5" style={{ color: 'var(--accent-orange)' }}>{e.location}</div>
                <div className="font-terminal" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                  {e.sourceCount} sources: {e.sources.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="px-3 py-1.5 font-terminal shrink-0 mt-auto"
        style={{ fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}
      >
        Updated {assessment ? new Date(assessment.lastUpdated).toLocaleTimeString() : '—'}
      </div>
    </div>
  )
}
