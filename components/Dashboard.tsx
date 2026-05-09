'use client'

import { useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import AlertBanner from './AlertBanner'
import MetricsPanel from './MetricsPanel'
import NewsFeed from './NewsFeed'
import TerminalLog from './TerminalLog'
import ConvergenceEngine from './ConvergenceEngine'
import LoadingScreen from './LoadingScreen'
import DeathCounter from './DeathCounter'
import type { GeoHotspot } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'

const Map2D = dynamic(() => import('./Globe'), { ssr: false })

export default function Dashboard() {
  const { allItems, assessment, sourceStatuses, terminalLog, isInitialLoad, hourlyActivity } = useDataRefresh()
  const [showLoading, setShowLoading] = useState(true)
  const [, setSelected] = useState<GeoHotspot | null>(null)

  const handleHotspotClick = useCallback((hs: GeoHotspot) => setSelected(hs), [])
  const bannerItems = useMemo(() => allItems.slice(0, 20), [allItems])

  const isLoading         = isInitialLoad && allItems.length === 0
  const hotspots          = assessment?.hotspots ?? []
  const convergenceEvents = assessment?.convergenceEvents ?? []

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: 'var(--canvas)', minWidth: '1280px', fontFamily: 'var(--font-body)' }}
    >
      {showLoading && <LoadingScreen onDone={() => setShowLoading(false)} />}

      {/* Top nav bar */}
      <AlertBanner assessment={assessment} recentItems={bannerItems} />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>

        {/* ── Left panel: metrics ────────────────────────────────────── */}
        <MetricsPanel
          assessment={assessment}
          sourceStatuses={sourceStatuses}
          hourlyActivity={hourlyActivity}
          onHotspotSelect={handleHotspotClick}
          isLoading={isLoading}
        />

        {/* ── Centre: map + death counter ───────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ borderLeft: '1px solid var(--hairline)', borderRight: '1px solid var(--hairline)' }}>

          {/* Map — dark card fills most of the space */}
          <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
            <div
              className="card-dark"
              style={{ position: 'absolute', inset: '12px 12px 0 12px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, overflow: 'hidden' }}
            >
              {/* Map header */}
              <div
                className="flex items-center justify-between px-4 py-2 shrink-0"
                style={{ borderBottom: '1px solid #2a2521' }}
              >
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-dark-soft)', fontFamily: 'var(--font-body)' }}>
                  Global Surveillance  ·  Real-Time
                </span>
                {assessment && (
                  <span style={{ fontSize: '11px', color: 'var(--on-dark-soft)', fontFamily: 'var(--font-mono)' }}>
                    {assessment.hotspots.length} regions  ·  {assessment.signalCount} signals
                  </span>
                )}
              </div>

              {/* Map */}
              <div style={{ position: 'relative', height: 'calc(100% - 36px)' }}>
                <Map2D hotspots={hotspots} onHotspotClick={handleHotspotClick} />

                {/* Convergence overlay */}
                {convergenceEvents.length > 0 && (
                  <div
                    style={{
                      position: 'absolute', top: '8px', left: '8px', right: '8px', zIndex: 1000,
                      maxWidth: '340px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: '#fb923c', fontFamily: 'var(--font-body)', marginBottom: '6px',
                      }}
                    >
                      ⚠ Convergence Events
                    </div>
                    <ConvergenceEngine events={convergenceEvents} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Death counter + key signals — horizontal strip below map */}
          <div
            className="shrink-0 flex gap-3 overflow-hidden"
            style={{ height: '260px', padding: '0 12px 12px', minHeight: 0 }}
          >
            {/* Death counter card */}
            <div style={{ width: '320px', flexShrink: 0 }}>
              <DeathCounter />
            </div>

            {/* Key signals card */}
            <div className="card flex-1 overflow-hidden flex flex-col" style={{ padding: '16px 20px' }}>
              {/* Orb */}
              <div className="orb" style={{ width: '200px', height: '200px', background: 'radial-gradient(circle, var(--orb-mint) 0%, transparent 70%)', bottom: '-60px', right: '-40px', opacity: 0.4 }} />

              <div className="caption-up mb-3">Key Signals</div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="skeleton h-3" style={{ width: '80%' }} />
                      <div className="skeleton h-2.5" style={{ width: '50%' }} />
                    </div>
                  ))
                ) : assessment?.keySignals.length ? (
                  assessment.keySignals.map((s, i) => (
                    <div key={i} style={{ paddingBottom: '12px', borderBottom: i < (assessment.keySignals.length - 1) ? '1px solid var(--hairline-soft)' : undefined }}>
                      <p style={{ fontSize: '14px', lineHeight: 1.45, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0 }}>{s}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--muted-soft)', fontFamily: 'var(--font-body)' }}>
                    Polling sources for relevant signals…
                  </p>
                )}
              </div>

              {/* ThreatMatrix at bottom */}
              {assessment && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--hairline)' }}>
                  <div className="caption-up mb-2">Threat Matrix</div>
                  {/* Inline horizontal segments */}
                  {(() => {
                    const LEVELS = ['MINIMAL','LOW','MODERATE','ELEVATED','HIGH','CRITICAL'] as const
                    const idx = LEVELS.indexOf(assessment.globalThreatLevel)
                    return (
                      <div className="flex gap-1">
                        {LEVELS.map((level, i) => (
                          <div key={level} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= idx ? getThreatColor(level) : 'var(--hairline)', opacity: i < idx ? 0.45 : 1 }} />
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right panel: feed ──────────────────────────────────────── */}
        <NewsFeed items={allItems} isLoading={isLoading} />
      </div>

      {/* Bottom terminal log */}
      <TerminalLog lines={terminalLog} />
    </div>
  )
}
