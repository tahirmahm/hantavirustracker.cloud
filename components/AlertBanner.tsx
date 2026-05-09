'use client'

import { useMemo } from 'react'
import type { ThreatAssessment } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'
import type { ParsedFeedItem } from '@/lib/feedParser'
import { formatDistanceToNow } from 'date-fns'

interface AlertBannerProps {
  assessment: ThreatAssessment | null
  recentItems: ParsedFeedItem[]
}

export default function AlertBanner({ assessment, recentItems }: AlertBannerProps) {
  const alerts = useMemo(() => {
    const items: string[] = []

    if (assessment) {
      items.push(`▶ GLOBAL THREAT LEVEL: ${assessment.globalThreatLevel} · Score: ${assessment.threatScore}/100`)
      if (assessment.convergenceEvents.length > 0) {
        for (const e of assessment.convergenceEvents) {
          items.push(`▶ CONVERGENCE EVENT: ${e.location} · ${e.sourceCount} independent sources · ${e.sources.join(', ')}`)
        }
      }
      if (assessment.hotspots.length > 0) {
        const top = assessment.hotspots[0]
        items.push(`▶ TOP HOTSPOT: ${top.country} · ${top.signalCount} signals · Threat: ${top.threatLevel}`)
      }
    }

    for (const item of recentItems.slice(0, 8)) {
      let prefix = '▶'
      const ts = (() => {
        try { return formatDistanceToNow(new Date(item.pubDate), { addSuffix: true }) } catch { return '' }
      })()
      items.push(`${prefix} ${item.source}: ${item.title}${ts ? ' · ' + ts : ''}`)
    }

    if (items.length === 0) {
      items.push('▶ HANTAVIRUS TRACKER CLOUD · Real-time global surveillance active · All systems nominal')
    }

    return items
  }, [assessment, recentItems])

  const tickerContent = alerts.join('          ')
  const doubledContent = `${tickerContent}          ${tickerContent}`
  const threatColor = assessment ? getThreatColor(assessment.globalThreatLevel) : '#00d4ff'

  return (
    <div
      className="flex items-center shrink-0 overflow-hidden"
      style={{
        height: '40px',
        background: '#080c12',
        borderBottom: `1px solid ${threatColor}22`,
      }}
      aria-live="polite"
      aria-label="Live threat alerts ticker"
    >
      {/* Left label */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 h-full font-display text-xs"
        style={{
          background: `${threatColor}18`,
          borderRight: `1px solid ${threatColor}44`,
          color: threatColor,
          minWidth: '180px',
          letterSpacing: '0.1em',
        }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0 dot-live"
          style={{ background: threatColor, boxShadow: `0 0 6px ${threatColor}` }}
        />
        HANTAVIRUS TRACKER
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden h-full flex items-center">
        <div className="ticker-inner font-terminal text-xs" style={{ color: '#e8edf5' }}>
          {doubledContent}
        </div>
      </div>

      {/* Right: threat level badge */}
      <div
        className="shrink-0 flex items-center px-3 h-full font-display text-xs"
        style={{
          background: `${threatColor}18`,
          borderLeft: `1px solid ${threatColor}44`,
          color: threatColor,
          letterSpacing: '0.1em',
          minWidth: '120px',
        }}
      >
        THREAT: {assessment?.globalThreatLevel ?? '---'}
      </div>
    </div>
  )
}
