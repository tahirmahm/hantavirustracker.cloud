'use client'

import { useMemo } from 'react'
import type { ThreatAssessment } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'
import type { ParsedFeedItem } from '@/lib/feedParser'
import { formatDistanceToNow } from 'date-fns'

interface AlertBannerProps {
  assessment: ThreatAssessment | null
  recentItems: ParsedFeedItem[]
  /** compact=true hides the ticker — used on mobile */
  compact?: boolean
}

function threatBadgeClass(level: string) {
  const map: Record<string, string> = {
    MINIMAL: 'badge-minimal', LOW: 'badge-low', MODERATE: 'badge-moderate',
    ELEVATED: 'badge-elevated', HIGH: 'badge-high', CRITICAL: 'badge-critical',
  }
  return map[level] ?? 'badge'
}

export default function AlertBanner({ assessment, recentItems, compact }: AlertBannerProps) {
  const alerts = useMemo(() => {
    const items: string[] = []
    if (assessment) {
      for (const e of assessment.convergenceEvents) {
        items.push(`Convergence — ${e.location}: ${e.sourceCount} sources (${e.sources.join(', ')})`)
      }
      if (assessment.hotspots[0]) {
        const t = assessment.hotspots[0]
        items.push(`Top hotspot: ${t.country}  ·  ${t.signalCount} signals  ·  ${t.threatLevel}`)
      }
    }
    for (const item of recentItems.slice(0, 12)) {
      let ts = ''
      try { ts = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true }) } catch { /* */ }
      items.push(`${item.source}: ${item.title}${ts ? '  ·  ' + ts : ''}`)
    }
    if (!items.length) items.push('HantavirusTracker.cloud  ·  Real-time global hantavirus surveillance  ·  All feeds nominal')
    return items
  }, [assessment, recentItems])

  const content = alerts.join('          ·          ')
  const doubled = content + '          ·          ' + content
  const level   = assessment?.globalThreatLevel ?? 'MINIMAL'

  return (
    <div
      className="flex items-center shrink-0 overflow-hidden"
      style={{
        height: '40px',
        background: 'var(--surface-card)',
        borderBottom: '1px solid var(--hairline)',
      }}
      aria-live="polite"
    >
      {/* Brand wordmark */}
      <div
        className="shrink-0 flex items-center gap-2.5 px-4 h-full"
        style={{ borderRight: '1px solid var(--hairline)', minWidth: '200px' }}
      >
        <span
          className="font-display italic"
          style={{ fontSize: '15px', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.01em' }}
        >
          HantavirusTracker
        </span>
        <span className="w-px h-4 self-center" style={{ background: 'var(--hairline-strong)' }} />
        <span className={`badge ${threatBadgeClass(level)}`} style={{ fontSize: '10px' }}>{level}</span>
      </div>

      {/* Ticker — hidden on compact/mobile */}
      {!compact && (
        <div className="flex-1 overflow-hidden h-full flex items-center">
          <div
            className="ticker-inner"
            style={{ fontSize: '12px', color: 'var(--body)', fontFamily: 'var(--font-body)', fontWeight: 400, letterSpacing: '0.01em' }}
          >
            {doubled}
          </div>
        </div>
      )}

      {/* Score pill */}
      <div
        className="shrink-0 flex items-center px-4 h-full gap-2"
        style={{ borderLeft: '1px solid var(--hairline)', minWidth: '100px' }}
      >
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>Score</span>
        <span
          className="font-display"
          style={{ fontSize: '20px', fontWeight: 400, color: getThreatColor(level), letterSpacing: '-0.02em' }}
        >
          {assessment?.threatScore ?? '—'}
        </span>
      </div>
    </div>
  )
}
