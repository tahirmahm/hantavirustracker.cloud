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
      items.push(`Global threat: ${assessment.globalThreatLevel} (${assessment.threatScore}/100)`)
      for (const e of assessment.convergenceEvents) {
        items.push(`Convergence — ${e.location}: ${e.sourceCount} independent sources (${e.sources.join(', ')})`)
      }
      if (assessment.hotspots[0]) {
        const t = assessment.hotspots[0]
        items.push(`Top hotspot: ${t.country} · ${t.signalCount} signals · ${t.threatLevel}`)
      }
    }
    for (const item of recentItems.slice(0, 10)) {
      let ts = ''
      try { ts = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true }) } catch { /* */ }
      items.push(`${item.source}: ${item.title}${ts ? '  ·  ' + ts : ''}`)
    }
    if (!items.length) items.push('HantavirusTracker.cloud · Real-time global hantavirus surveillance · All feeds nominal')
    return items
  }, [assessment, recentItems])

  const content = alerts.join('     ·     ')
  const doubled = content + '     ·     ' + content
  const threatColor = assessment ? getThreatColor(assessment.globalThreatLevel) : 'var(--accent-blue)'

  return (
    <div
      className="flex items-center shrink-0 overflow-hidden"
      style={{
        height: '36px',
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
      }}
      aria-live="polite"
    >
      {/* Label */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 h-full font-ui font-semibold text-xs"
        style={{
          background: 'var(--bg-highlight)',
          borderRight: '1px solid var(--border)',
          color: threatColor,
          minWidth: '160px',
          letterSpacing: '0.05em',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 dot-live"
          style={{ background: threatColor }}
        />
        HANTAVIRUS TRACKER
      </div>

      {/* Ticker */}
      <div className="flex-1 overflow-hidden h-full flex items-center px-1">
        <div className="ticker-inner font-terminal text-xs" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
          {doubled}
        </div>
      </div>

      {/* Threat badge */}
      <div
        className="shrink-0 px-3 h-full flex items-center font-ui font-semibold text-xs"
        style={{
          background: 'var(--bg-highlight)',
          borderLeft: '1px solid var(--border)',
          color: threatColor,
          minWidth: '100px',
          letterSpacing: '0.05em',
        }}
      >
        {assessment?.globalThreatLevel ?? '—'}
      </div>
    </div>
  )
}
