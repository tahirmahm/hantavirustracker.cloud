'use client'

import { useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import AlertBanner from './AlertBanner'
import MetricsPanel from './MetricsPanel'
import NewsFeed from './NewsFeed'
import TerminalLog from './TerminalLog'
import ThreatMatrix from './ThreatMatrix'
import ConvergenceEngine from './ConvergenceEngine'
import LoadingScreen from './LoadingScreen'
import type { GeoHotspot } from '@/lib/threatClassifier'

const Globe = dynamic(() => import('./Globe'), { ssr: false })

export default function Dashboard() {
  const {
    allItems,
    assessment,
    sourceStatuses,
    terminalLog,
    isInitialLoad,
    hourlyActivity,
  } = useDataRefresh()

  const [showLoading, setShowLoading] = useState(true)
  const [selectedHotspot, setSelectedHotspot] = useState<GeoHotspot | null>(null)
  const [newSignalLocation, setNewSignalLocation] = useState<{ lat: number; lng: number; source: string } | null>(null)

  const handleLoadingDone = useCallback(() => {
    setShowLoading(false)
  }, [])

  const handleHotspotClick = useCallback((hs: GeoHotspot) => {
    setSelectedHotspot(hs)
  }, [])

  // Pass recent high-relevance items to the alert banner
  const bannerItems = useMemo(() => {
    return allItems.slice(0, 20)
  }, [allItems])

  const hotspots = assessment?.hotspots ?? []
  const convergenceEvents = assessment?.convergenceEvents ?? []
  const isLoading = isInitialLoad && allItems.length === 0

  const threatLevel = assessment?.globalThreatLevel ?? 'MINIMAL'
  const isPulsing = threatLevel === 'HIGH' || threatLevel === 'CRITICAL'

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{
        background: 'var(--bg-void)',
        minWidth: '1280px',
        animation: showLoading ? undefined : 'globeFadeIn 0.5s ease-out',
      }}
    >
      {/* Loading screen */}
      {showLoading && <LoadingScreen onDone={handleLoadingDone} />}

      {/* Alert ticker */}
      <AlertBanner assessment={assessment} recentItems={bannerItems} />

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left panel */}
        <div
          className="flex flex-col shrink-0 overflow-hidden"
          style={{
            width: '280px',
            boxShadow: isPulsing ? undefined : undefined,
            animation: isPulsing ? 'threatPulse 2s ease-in-out infinite' : undefined,
          }}
        >
          <MetricsPanel
            assessment={assessment}
            sourceStatuses={sourceStatuses}
            hourlyActivity={hourlyActivity}
            onHotspotSelect={handleHotspotClick}
            isLoading={isLoading}
          />

          {/* Threat matrix embedded below metrics */}
          <div
            className="panel shrink-0"
            style={{ borderTop: '1px solid var(--bg-panel-border)' }}
          >
            <ThreatMatrix assessment={assessment} />
          </div>

          {/* Key signals */}
          {assessment && assessment.keySignals.length > 0 && (
            <div
              className="panel shrink-0 p-3 overflow-hidden"
              style={{ borderTop: '1px solid var(--bg-panel-border)' }}
            >
              <div className="font-ui text-xs mb-2" style={{ color: '#4a5568', letterSpacing: '0.1em' }}>
                KEY SIGNALS
              </div>
              <div className="space-y-2">
                {assessment.keySignals.slice(0, 3).map((sig, i) => (
                  <div
                    key={i}
                    className="font-terminal leading-tight"
                    style={{ fontSize: '10px', color: '#8a9ab5' }}
                  >
                    <span style={{ color: '#00d4ff' }}>›</span> {sig}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Globe centrepiece */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{
            borderLeft: '1px solid var(--bg-panel-border)',
            borderRight: '1px solid var(--bg-panel-border)',
          }}
        >
          {/* Globe label overlay */}
          <div
            className="absolute top-3 left-3 z-10 font-display text-xs tracking-widest pointer-events-none"
            style={{ color: 'rgba(0,212,255,0.5)', letterSpacing: '0.2em' }}
          >
            GLOBAL SURVEILLANCE · REAL-TIME
          </div>

          {/* Convergence events overlay */}
          {convergenceEvents.length > 0 && (
            <div className="absolute top-10 left-3 right-3 z-10 pointer-events-none">
              <ConvergenceEngine events={convergenceEvents} />
            </div>
          )}

          {/* Coordinate display */}
          {selectedHotspot && (
            <div
              className="absolute bottom-12 left-3 z-10 font-terminal pointer-events-none"
              style={{ fontSize: '10px', color: 'rgba(0,212,255,0.6)' }}
            >
              LAT: {selectedHotspot.lat.toFixed(2)} · LNG: {selectedHotspot.lng.toFixed(2)}
            </div>
          )}

          {/* Loading globe skeleton */}
          {isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center z-20"
              style={{ background: 'var(--bg-void)' }}
            >
              <div className="text-center">
                <div
                  className="font-display text-sm mb-3 tracking-widest"
                  style={{ color: '#00d4ff' }}
                >
                  LOADING INTELLIGENCE
                </div>
                <div className="font-terminal text-xs" style={{ color: '#4a5568' }}>
                  Fetching surveillance feeds...
                </div>
              </div>
            </div>
          )}

          <Globe
            hotspots={hotspots}
            onHotspotClick={handleHotspotClick}
            newSignalLocation={newSignalLocation}
          />
        </div>

        {/* Right panel */}
        <NewsFeed items={allItems} isLoading={isLoading} />
      </div>

      {/* Terminal log */}
      <TerminalLog lines={terminalLog} />
    </div>
  )
}
