'use client'

import { useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import AlertBanner from './AlertBanner'
import MetricsPanel from './MetricsPanel'
import NewsFeed from './NewsFeed'
import TerminalLog from './TerminalLog'
import ConvergenceEngine from './ConvergenceEngine'
import LoadingScreen from './LoadingScreen'
import DeathCounter from './DeathCounter'
import MobileTabBar, { type MobileTab } from './MobileTabBar'
import type { GeoHotspot, ThreatAssessment } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'
import type { SourceStatus } from '@/hooks/useDataRefresh'
import type { ParsedFeedItem } from '@/lib/feedParser'

const Map2D = dynamic(() => import('./Globe'), { ssr: false })

/* ── Shared sub-components ─────────────────────────────────── */

function MapCard({
  hotspots,
  convergenceEvents,
  assessment,
  onHotspotClick,
  style,
}: {
  hotspots: GeoHotspot[]
  convergenceEvents: ThreatAssessment['convergenceEvents']
  assessment: ThreatAssessment | null
  onHotspotClick: (hs: GeoHotspot) => void
  style?: React.CSSProperties
}) {
  return (
    <div className="card-dark" style={{ position: 'absolute', overflow: 'hidden', ...style }}>
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid #2a2521' }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-dark-soft)', fontFamily: 'var(--font-body)' }}>
          Global Surveillance · Real-Time
        </span>
        {assessment && (
          <span style={{ fontSize: '11px', color: 'var(--on-dark-soft)', fontFamily: 'var(--font-mono)' }}>
            {assessment.hotspots.length} regions · {assessment.signalCount} signals
          </span>
        )}
      </div>
      <div style={{ position: 'relative', height: 'calc(100% - 36px)' }}>
        <Map2D hotspots={hotspots} onHotspotClick={onHotspotClick} />
        {convergenceEvents.length > 0 && (
          <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', zIndex: 1000, maxWidth: '340px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fb923c', fontFamily: 'var(--font-body)', marginBottom: '6px' }}>
              ⚠ Convergence Events
            </div>
            <ConvergenceEngine events={convergenceEvents} />
          </div>
        )}
      </div>
    </div>
  )
}

function KeySignalsCard({
  assessment,
  isLoading,
}: {
  assessment: ThreatAssessment | null
  isLoading: boolean
}) {
  return (
    <div className="card flex-1 overflow-hidden flex flex-col" style={{ padding: '16px 20px', position: 'relative' }}>
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
      {assessment && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--hairline)' }}>
          <div className="caption-up mb-2">Threat Matrix</div>
          {(() => {
            const LEVELS = ['MINIMAL', 'LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL'] as const
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
  )
}

/* ── Layouts ───────────────────────────────────────────────── */

interface SharedProps {
  assessment: ThreatAssessment | null
  sourceStatuses: SourceStatus[]
  hourlyActivity: number[]
  terminalLog: string[]
  allItems: ParsedFeedItem[]
  bannerItems: ParsedFeedItem[]
  hotspots: GeoHotspot[]
  convergenceEvents: ThreatAssessment['convergenceEvents']
  isLoading: boolean
  handleHotspotClick: (hs: GeoHotspot) => void
  showLoading: boolean
  onLoadDone: () => void
}

function DesktopLayout(p: SharedProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--canvas)', fontFamily: 'var(--font-body)' }}>
      {p.showLoading && <LoadingScreen onDone={p.onLoadDone} />}
      <AlertBanner assessment={p.assessment} recentItems={p.bannerItems} />
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left: Metrics */}
        <MetricsPanel
          assessment={p.assessment}
          sourceStatuses={p.sourceStatuses}
          hourlyActivity={p.hourlyActivity}
          onHotspotSelect={p.handleHotspotClick}
          isLoading={p.isLoading}
        />
        {/* Centre: Map + bottom strip */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ borderLeft: '1px solid var(--hairline)', borderRight: '1px solid var(--hairline)' }}>
          <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
            <MapCard
              hotspots={p.hotspots}
              convergenceEvents={p.convergenceEvents}
              assessment={p.assessment}
              onHotspotClick={p.handleHotspotClick}
              style={{ inset: '12px 12px 0 12px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            />
          </div>
          <div className="shrink-0 flex gap-3 overflow-hidden" style={{ height: '260px', padding: '0 12px 12px', minHeight: 0 }}>
            <div style={{ width: '320px', flexShrink: 0 }}>
              <DeathCounter />
            </div>
            <KeySignalsCard assessment={p.assessment} isLoading={p.isLoading} />
          </div>
        </div>
        {/* Right: Feed */}
        <NewsFeed items={p.allItems} isLoading={p.isLoading} />
      </div>
      <TerminalLog lines={p.terminalLog} />
    </div>
  )
}

function TabletLayout(p: SharedProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--canvas)', fontFamily: 'var(--font-body)' }}>
      {p.showLoading && <LoadingScreen onDone={p.onLoadDone} />}
      <AlertBanner assessment={p.assessment} recentItems={p.bannerItems} />
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left: Map + bottom strip */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: '1px solid var(--hairline)' }}>
          <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
            <MapCard
              hotspots={p.hotspots}
              convergenceEvents={p.convergenceEvents}
              assessment={p.assessment}
              onHotspotClick={p.handleHotspotClick}
              style={{ inset: '10px 10px 0 10px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            />
          </div>
          {/* Death counter + key signals below map */}
          <div className="shrink-0 flex gap-2 overflow-hidden" style={{ height: '200px', padding: '0 10px 10px', minHeight: 0 }}>
            <div style={{ width: '260px', flexShrink: 0 }}>
              <DeathCounter />
            </div>
            <KeySignalsCard assessment={p.assessment} isLoading={p.isLoading} />
          </div>
        </div>
        {/* Right sidebar: Metrics + Feed stacked */}
        <div className="flex flex-col overflow-hidden" style={{ width: '300px', flexShrink: 0 }}>
          <div className="overflow-y-auto" style={{ height: '50%', borderBottom: '1px solid var(--hairline)' }}>
            <MetricsPanel
              assessment={p.assessment}
              sourceStatuses={p.sourceStatuses}
              hourlyActivity={p.hourlyActivity}
              onHotspotSelect={p.handleHotspotClick}
              isLoading={p.isLoading}
              fluid
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <NewsFeed items={p.allItems} isLoading={p.isLoading} fluid />
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0, height: '100px', overflow: 'hidden' }}>
        <TerminalLog lines={p.terminalLog} fillHeight />
      </div>
    </div>
  )
}

function MobileLayout(p: SharedProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('map')
  const TAB_BAR_H = 'calc(56px + env(safe-area-inset-bottom, 0px))'

  // Each panel is rendered at full size but opacity/pointer-events toggled.
  // This keeps the Leaflet map mounted at correct dimensions on all tabs.
  const panelStyle = (tab: MobileTab): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    opacity: activeTab === tab ? 1 : 0,
    pointerEvents: activeTab === tab ? 'auto' : 'none',
    transition: 'opacity 0.18s ease',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  })

  return (
    <div
      className="flex flex-col w-screen overflow-hidden"
      style={{ height: '100dvh', background: 'var(--canvas)', fontFamily: 'var(--font-body)' }}
    >
      {p.showLoading && <LoadingScreen onDone={p.onLoadDone} />}
      <AlertBanner assessment={p.assessment} recentItems={p.bannerItems} compact />

      {/* Tab panels stacked absolutely inside this relative container */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ minHeight: 0, paddingBottom: TAB_BAR_H }}
      >
        {/* ── Map tab ── */}
        <div style={panelStyle('map')}>
          {/* Map fills remaining height after death counter strip */}
          <div className="relative overflow-hidden" style={{ flex: '1 1 0', minHeight: 0 }}>
            <MapCard
              hotspots={p.hotspots}
              convergenceEvents={p.convergenceEvents}
              assessment={p.assessment}
              onHotspotClick={p.handleHotspotClick}
              style={{ inset: '8px 8px 0 8px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            />
          </div>
          {/* Death counter strip at bottom of map tab */}
          <div className="shrink-0 overflow-y-auto" style={{ maxHeight: '200px', padding: '8px' }}>
            <DeathCounter />
          </div>
        </div>

        {/* ── Metrics tab ── */}
        <div style={{ ...panelStyle('metrics'), overflowY: 'auto' }}>
          <MetricsPanel
            assessment={p.assessment}
            sourceStatuses={p.sourceStatuses}
            hourlyActivity={p.hourlyActivity}
            onHotspotSelect={p.handleHotspotClick}
            isLoading={p.isLoading}
            fluid
          />
        </div>

        {/* ── Feed tab ── */}
        <div style={panelStyle('feed')}>
          <NewsFeed items={p.allItems} isLoading={p.isLoading} fluid />
        </div>

        {/* ── Log tab ── */}
        <div style={{ ...panelStyle('log'), flexDirection: 'column' }}>
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <TerminalLog lines={p.terminalLog} fillHeight />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '220px', padding: '8px' }}>
            <KeySignalsCard assessment={p.assessment} isLoading={p.isLoading} />
          </div>
        </div>
      </div>

      <MobileTabBar active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

/* ── Root component ────────────────────────────────────────── */

export default function Dashboard() {
  const bp = useBreakpoint()
  const { allItems, assessment, sourceStatuses, terminalLog, isInitialLoad, hourlyActivity } = useDataRefresh()
  const [showLoading, setShowLoading] = useState(true)
  const [, setSelected] = useState<GeoHotspot | null>(null)

  const handleHotspotClick = useCallback((hs: GeoHotspot) => setSelected(hs), [])
  const bannerItems = useMemo(() => allItems.slice(0, 20), [allItems])

  const isLoading         = isInitialLoad && allItems.length === 0
  const hotspots          = assessment?.hotspots ?? []
  const convergenceEvents = assessment?.convergenceEvents ?? []
  const onLoadDone        = useCallback(() => setShowLoading(false), [])

  const shared: SharedProps = {
    assessment,
    sourceStatuses,
    hourlyActivity,
    terminalLog,
    allItems,
    bannerItems,
    hotspots,
    convergenceEvents,
    isLoading,
    handleHotspotClick,
    showLoading,
    onLoadDone,
  }

  if (bp === 'mobile')  return <MobileLayout {...shared} />
  if (bp === 'tablet')  return <TabletLayout {...shared} />
  return <DesktopLayout {...shared} />
}
