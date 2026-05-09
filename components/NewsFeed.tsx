'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import type { ParsedFeedItem } from '@/lib/feedParser'
import { scoreSignal } from '@/lib/threatClassifier'
import type { SourceType } from '@/lib/threatClassifier'
import { formatDistanceToNow } from 'date-fns'

type FeedTab = 'ALL' | 'WHO/CDC' | 'NEWS' | 'ACADEMIC' | 'YOUTUBE'

const SOURCE_COLORS: Record<string, string> = {
  'BBC World':      '#e05252',
  'Al Jazeera':     '#52c77c',
  'DW News':        '#4a9eff',
  'France 24':      '#4a7eff',
  'Guardian':       '#4a9eff',
  'WHO DON':        '#4a9eff',
  'CDC Hantavirus': '#4a9eff',
  'ProMED Mail':    '#e07b39',
  'ECDC':           '#9b7fe8',
  'PubMed':         '#9b7fe8',
  'WHO YouTube':    '#e05252',
  'CDC YouTube':    '#e05252',
}

function getSourceColor(item: ParsedFeedItem): string {
  return SOURCE_COLORS[item.source] ?? 'var(--text-muted)'
}

function relBar(score: number) {
  const color = score >= 50 ? 'var(--threat-high)' : score >= 20 ? 'var(--threat-elevated)' : score >= 5 ? 'var(--threat-moderate)' : 'var(--border)'
  return { width: `${Math.max(4, score)}%`, color }
}

const FeedCard = memo(function FeedCard({ item, score }: { item: ParsedFeedItem; score: number }) {
  const rel = relBar(score)
  const color = getSourceColor(item)
  const hi = score > 15

  let ts = ''
  try { ts = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true }) } catch { /* */ }

  const handleClick = useCallback(() => { if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer') }, [item.link])

  return (
    <div
      className="feed-card px-3 py-2 fade-in"
      style={{
        borderBottom: '1px solid var(--border-light)',
        borderLeft: hi ? `2px solid ${rel.color}` : '2px solid transparent',
      }}
      onClick={handleClick}
      role={item.link ? 'link' : undefined}
      tabIndex={item.link ? 0 : undefined}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <div className="flex items-start gap-2">
        {item.isYouTube && item.thumbnailUrl && (
          <img src={item.thumbnailUrl} alt="" className="shrink-0 rounded" style={{ width: '56px', height: '32px', objectFit: 'cover', opacity: 0.7 }} loading="lazy" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="font-terminal shrink-0 px-1 rounded-sm"
              style={{ fontSize: '10px', background: `${color}18`, color, border: `1px solid ${color}30` }}
            >
              {item.source}
            </span>
            <span className="font-terminal shrink-0" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {ts}
            </span>
          </div>
          <div
            className="font-terminal leading-snug mb-1.5 line-clamp-2"
            style={{ fontSize: '11px', color: score > 3 ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            {item.title}
          </div>
          <div className="relevance-bar">
            <div className="relevance-fill" style={{ width: rel.width, background: rel.color }} />
          </div>
        </div>
      </div>
    </div>
  )
})

export default function NewsFeed({ items, isLoading }: { items: ParsedFeedItem[]; isLoading: boolean }) {
  const [tab, setTab] = useState<FeedTab>('ALL')
  const [q, setQ] = useState('')

  const scored = useMemo(() => items.map(item => ({
    item,
    score: scoreSignal({ id: item.id, source: item.sourceType as SourceType, text: item.description, title: item.title, date: item.pubDate }).score,
  })).sort((a, b) => b.score !== a.score ? b.score - a.score : new Date(b.item.pubDate).getTime() - new Date(a.item.pubDate).getTime()),
  [items])

  const filtered = useMemo(() => {
    let r = scored
    if (tab !== 'ALL') r = r.filter(({ item }) => {
      if (tab === 'WHO/CDC') return ['WHO','CDC','ProMED','ECDC'].includes(item.sourceType)
      if (tab === 'NEWS')    return item.sourceType === 'NewsChannel' && !item.isYouTube
      if (tab === 'ACADEMIC') return item.sourceType === 'PubMed'
      if (tab === 'YOUTUBE') return !!item.isYouTube
      return true
    })
    if (q.trim()) {
      const ql = q.toLowerCase()
      r = r.filter(({ item }) => item.title.toLowerCase().includes(ql) || item.description.toLowerCase().includes(ql))
    }
    return r.slice(0, 100)
  }, [scored, tab, q])

  const tabs: FeedTab[] = ['ALL', 'WHO/CDC', 'NEWS', 'ACADEMIC', 'YOUTUBE']

  return (
    <div className="panel flex flex-col h-full overflow-hidden" style={{ width: '310px', borderLeft: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-highlight)' }}>
        <div className="section-label">Live Intelligence Feed</div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-1.5 font-terminal text-xs whitespace-nowrap transition-colors"
            style={{
              color: tab === t ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--accent-blue)' : '2px solid transparent',
              background: 'transparent',
              fontSize: '10px',
              letterSpacing: '0.04em',
              marginBottom: '-1px',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder="Filter signals..."
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full font-terminal text-xs px-2 py-1 rounded"
          style={{
            background: 'var(--bg-void)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '11px',
          }}
        />
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && !filtered.length ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="skeleton h-2.5" style={{ width: '55%' }} />
                <div className="skeleton h-2.5" />
                <div className="skeleton h-1.5" style={{ width: '35%' }} />
              </div>
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="p-6 text-center font-terminal text-xs" style={{ color: 'var(--text-muted)' }}>
            No signals matching criteria
          </div>
        ) : (
          filtered.map(({ item, score }) => <FeedCard key={item.id} item={item} score={score} />)
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-1.5 font-terminal flex items-center gap-2 shrink-0"
        style={{ fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full dot-live" style={{ background: 'var(--threat-minimal)' }} />
        {filtered.length} shown · {items.length} total
      </div>
    </div>
  )
}
