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
import type { GeoHotspot } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'

const Map2D = dynamic(() => import('./Globe'), { ssr: false })

export default function Dashboard() {
  const { allItems, assessment, sourceStatuses, terminalLog, isInitialLoad, hourlyActivity } = useDataRefresh()
  const [showLoading, setShowLoading] = useState(true)
  const [, setSelectedHotspot] = useState<GeoHotspot | null>(null)

  const handleHotspotClick = useCallback((hs: GeoHotspot) => setSelectedHotspot(hs), [])
  const bannerItems = useMemo(() => allItems.slice(0, 20), [allItems])
  const isLoading = isInitialLoad && allItems.length === 0
  const hotspots = assessment?.hotspots ?? []
  const convergenceEvents = assessment?.convergenceEvents ?? []

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden font-ui"
      style={{ background: 'var(--bg-void)', minWidth: '1280px' }}
    >
      {showLoading && <LoadingScreen onDone={() => setShowLoading(false)} />}

      {/* Top bar */}
      <AlertBanner assessment={assessment} recentItems={bannerItems} />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>

        {/* Left: metrics */}
        <MetricsPanel
          assessment={assessment}
          sourceStatuses={sourceStatuses}
          hourlyActivity={hourlyActivity}
          onHotspotSelect={handleHotspotClick}
          isLoading={isLoading}
        />

        {/* Centre: map */}
        <div className="flex-1 relative overflow-hidden" style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
          {/* Map header bar */}
          <div
            className="absolute top-0 left-0 right-0 z-[900] flex items-center justify-between px-3"
            style={{
              height: '32px',
              background: 'rgba(13,17,23,0.85)',
              borderBottom: '1px solid var(--border)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span className="section-label">Global Surveillance · Real-Time</span>
            {assessment && (
              <span
                className="font-terminal text-xs"
                style={{ color: getThreatColor(assessment.globalThreatLevel), fontSize: '10px' }}
              >
                {assessment.hotspots.length} active regions · {assessment.signalCount} signals
              </span>
            )}
          </div>

          {/* Convergence overlay */}
          {convergenceEvents.length > 0 && (
            <div
              className="absolute z-[900] p-2"
              style={{ top: '40px', left: '8px', right: '8px', maxWidth: '340px' }}
            >
              <div className="section-label mb-1.5" style={{ color: 'var(--accent-orange)' }}>⚠ Convergence Events</div>
              <ConvergenceEngine events={convergenceEvents} />
            </div>
          )}

          {/* Key signals overlay — bottom-left */}
          {assessment && assessment.keySignals.length > 0 && (
            <div
              className="absolute bottom-2 left-2 z-[900] p-2 rounded"
              style={{
                background: 'rgba(13,17,23,0.85)',
                border: '1px solid var(--border)',
                maxWidth: '320px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <div className="section-label mb-1">Key Signals</div>
              {assessment.keySignals.slice(0, 2).map((s, i) => (
                <div key={i} className="font-terminal leading-snug" style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  › {s}
                </div>
              ))}
            </div>
          )}

          <Map2D
            hotspots={hotspots}
            onHotspotClick={handleHotspotClick}
          />
        </div>

        {/* Right: feed */}
        <NewsFeed items={allItems} isLoading={isLoading} />
      </div>

      {/* Bottom: terminal log */}
      <TerminalLog lines={terminalLog} />
    </div>
  )
}
