'use client'

import { useEffect, useState, useRef } from 'react'
import type { ThreatAssessment, GeoHotspot } from '@/lib/threatClassifier'
import { getThreatColor, getThreatGlowClass } from '@/lib/threatClassifier'
import type { SourceStatus } from '@/hooks/useDataRefresh'
import { formatDistanceToNow } from 'date-fns'

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
    const end = target
    const duration = 800
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.round(start + (end - start) * eased)
      setDisplay(value)
      if (progress < 1) requestAnimationFrame(animate)
      else prevRef.current = end
    }

    requestAnimationFrame(animate)
  }, [target])

  return <>{display}</>
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const width = 240
  const height = 32
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - (v / max) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke="#00d4ff"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <polyline
        points={`0,${height} ${pts} ${width},${height}`}
        fill="url(#sparkGrad)"
        opacity="0.2"
      />
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function StatusDot({ status }: { status: SourceStatus['status'] }) {
  const color =
    status === 'live' ? '#00ff88' :
    status === 'loading' ? '#00d4ff' :
    status === 'stale' ? '#f0c040' :
    status === 'error' ? '#ff2040' : '#4a5568'

  const pulse = status === 'live' || status === 'loading'

  return (
    <span
      className={`w-2 h-2 rounded-full inline-block shrink-0 ${pulse ? 'dot-live' : ''}`}
      style={{ background: color, boxShadow: `0 0 4px ${color}` }}
    />
  )
}

export default function MetricsPanel({
  assessment,
  sourceStatuses,
  hourlyActivity,
  onHotspotSelect,
  isLoading,
}: MetricsPanelProps) {
  const level = assessment?.globalThreatLevel ?? 'MINIMAL'
  const score = assessment?.threatScore ?? 0
  const threatColor = getThreatColor(level)
  const glowClass = getThreatGlowClass(level)

  return (
    <div
      className="panel panel-corners flex flex-col h-full overflow-hidden"
      style={{ width: '280px', borderRight: '1px solid var(--bg-panel-border)' }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 font-display text-xs tracking-widest shrink-0"
        style={{
          color: '#00d4ff',
          borderBottom: '1px solid var(--bg-panel-border)',
          background: 'rgba(0,212,255,0.04)',
        }}
      >
        INTELLIGENCE OVERVIEW
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Global Threat Score */}
        <div
          className="p-4 shrink-0"
          style={{ borderBottom: '1px solid var(--bg-panel-border)' }}
        >
          <div className="font-ui text-xs mb-1" style={{ color: '#4a5568', letterSpacing: '0.1em' }}>
            GLOBAL THREAT SCORE
          </div>
          <div
            className={`font-display text-6xl font-black leading-none ${glowClass}`}
            style={{ letterSpacing: '-0.02em' }}
          >
            {isLoading ? (
              <span className="skeleton inline-block w-24 h-16" />
            ) : (
              <AnimatedScore target={score} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="w-2 h-2 rounded-full dot-live"
              style={{ background: threatColor, boxShadow: `0 0 6px ${threatColor}` }}
            />
            <span
              className="font-display text-xs tracking-widest"
              style={{ color: threatColor }}
            >
              {level}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-2 gap-px shrink-0"
          style={{ borderBottom: '1px solid var(--bg-panel-border)', background: 'var(--bg-panel-border)' }}
        >
          <div className="p-3" style={{ background: 'var(--bg-panel)' }}>
            <div className="font-ui text-xs mb-1" style={{ color: '#4a5568' }}>HOTSPOTS</div>
            <div className="font-display text-xl" style={{ color: '#00d4ff' }}>
              {assessment?.hotspots.length ?? 0}
            </div>
          </div>
          <div className="p-3" style={{ background: 'var(--bg-panel)' }}>
            <div className="font-ui text-xs mb-1" style={{ color: '#4a5568' }}>SIGNALS</div>
            <div className="font-display text-xl" style={{ color: '#00ff88' }}>
              {assessment?.signalCount ?? 0}
            </div>
          </div>
        </div>

        {/* Hourly activity sparkline */}
        <div
          className="p-3 shrink-0"
          style={{ borderBottom: '1px solid var(--bg-panel-border)' }}
        >
          <div className="font-ui text-xs mb-2" style={{ color: '#4a5568', letterSpacing: '0.1em' }}>
            24H ACTIVITY
          </div>
          <Sparkline data={hourlyActivity} />
        </div>

        {/* Source statuses */}
        <div
          className="p-3 shrink-0"
          style={{ borderBottom: '1px solid var(--bg-panel-border)' }}
        >
          <div className="font-ui text-xs mb-2" style={{ color: '#4a5568', letterSpacing: '0.1em' }}>
            INTELLIGENCE SOURCES
          </div>
          <div className="space-y-2">
            {sourceStatuses.map(src => (
              <div key={src.key} className="flex items-center gap-2">
                <StatusDot status={src.status} />
                <div className="flex-1 min-w-0">
                  <div className="font-terminal text-xs truncate" style={{ color: '#e8edf5' }}>
                    {src.name}
                  </div>
                  {src.lastFetch && (
                    <div className="font-terminal" style={{ fontSize: '10px', color: '#4a5568' }}>
                      {(() => {
                        try { return formatDistanceToNow(new Date(src.lastFetch), { addSuffix: true }) } catch { return '' }
                      })()}
                    </div>
                  )}
                </div>
                <div className="font-terminal text-xs shrink-0" style={{ color: '#4a5568' }}>
                  {src.itemCount > 0 ? src.itemCount : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hotspot rankings */}
        {assessment && assessment.hotspots.length > 0 && (
          <div
            className="p-3 shrink-0"
            style={{ borderBottom: '1px solid var(--bg-panel-border)' }}
          >
            <div className="font-ui text-xs mb-2" style={{ color: '#4a5568', letterSpacing: '0.1em' }}>
              TOP HOTSPOTS
            </div>
            <div className="space-y-2">
              {assessment.hotspots.slice(0, 5).map((hs, i) => {
                const color = getThreatColor(hs.threatLevel)
                return (
                  <button
                    key={hs.country}
                    className="w-full text-left hover:opacity-80 transition-opacity"
                    onClick={() => onHotspotSelect?.(hs)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-terminal text-xs" style={{ color: '#4a5568', minWidth: '14px' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-terminal text-xs truncate" style={{ color: '#e8edf5' }}>
                            {hs.country}
                          </span>
                          <span className="font-display text-xs shrink-0 ml-2" style={{ color }}>
                            {Math.round(hs.score)}
                          </span>
                        </div>
                        <div
                          className="h-px mt-1"
                          style={{
                            background: `linear-gradient(to right, ${color}66, transparent)`,
                            width: `${hs.intensity * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Convergence alerts */}
        {assessment && assessment.convergenceEvents.length > 0 && (
          <div className="p-3 shrink-0">
            <div
              className="font-ui text-xs mb-2"
              style={{ color: '#ff6b00', letterSpacing: '0.1em' }}
            >
              ⚠ CONVERGENCE EVENTS
            </div>
            <div className="space-y-2">
              {assessment.convergenceEvents.map(e => (
                <div
                  key={e.location}
                  className="p-2 rounded"
                  style={{
                    background: 'rgba(255,107,0,0.08)',
                    border: '1px solid rgba(255,107,0,0.3)',
                  }}
                >
                  <div className="font-terminal text-xs" style={{ color: '#ff6b00' }}>
                    {e.location}
                  </div>
                  <div className="font-terminal mt-1" style={{ fontSize: '10px', color: '#8a9ab5' }}>
                    {e.sourceCount} sources: {e.sources.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer timestamp */}
      <div
        className="px-3 py-2 font-terminal shrink-0"
        style={{
          fontSize: '10px',
          color: '#4a5568',
          borderTop: '1px solid var(--bg-panel-border)',
          background: 'rgba(0,0,0,0.3)',
        }}
      >
        UPDATED: {assessment ? new Date(assessment.lastUpdated).toLocaleTimeString() : '---'}
      </div>
    </div>
  )
}
