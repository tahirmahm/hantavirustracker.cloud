'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import type { ParsedFeedItem } from '@/lib/feedParser'
import { scoreSignal } from '@/lib/threatClassifier'
import type { SourceType } from '@/lib/threatClassifier'
import { formatDistanceToNow } from 'date-fns'

type Tab = 'ALL' | 'WHO/CDC' | 'NEWS' | 'ACADEMIC' | 'YOUTUBE'

const SRC_COLORS: Record<string, string> = {
  'BBC World': '#991b1b', 'Al Jazeera': '#15803d', 'DW News': '#1d4ed8',
  'France 24': '#1e40af', 'Guardian': '#1d4ed8', 'WHO DON': '#1e40af',
  'CDC Hantavirus': '#1e40af', 'ProMED Mail': '#c2410c', 'ECDC': '#6d28d9',
  'PubMed': '#7c3aed', 'WHO YouTube': '#dc2626', 'CDC YouTube': '#dc2626',
}

function relevanceBar(score: number) {
  const color =
    score >= 50 ? 'var(--sem-error)' :
    score >= 20 ? 'var(--threat-elevated)' :
    score >= 5  ? 'var(--threat-moderate)' :
    'var(--hairline)'
  return { width: `${Math.max(4, score)}%`, color }
}

const FeedCard = memo(function FeedCard({ item, score }: { item: ParsedFeedItem; score: number }) {
  const rel   = relevanceBar(score)
  const color = SRC_COLORS[item.source] ?? 'var(--muted)'
  const hi    = score > 15

  let ts = ''
  try { ts = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true }) } catch { /* */ }

  const open = useCallback(() => { if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer') }, [item.link])

  return (
    <div
      className="feed-card fade-in px-4 py-3"
      style={{
        borderBottom: '1px solid var(--hairline-soft)',
        borderLeft: hi ? `3px solid ${rel.color}` : '3px solid transparent',
      }}
      onClick={open}
      role={item.link ? 'link' : undefined}
      tabIndex={item.link ? 0 : undefined}
      onKeyDown={e => e.key === 'Enter' && open()}
    >
      <div className="flex gap-2">
        {item.isYouTube && item.thumbnailUrl && (
          <img
            src={item.thumbnailUrl} alt=""
            style={{ width: '56px', height: '32px', objectFit: 'cover', borderRadius: 'var(--r-sm)', flexShrink: 0, opacity: 0.85 }}
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                color, background: `${color}15`, border: `1px solid ${color}25`,
                padding: '1px 6px', borderRadius: 'var(--r-pill)', flexShrink: 0,
                fontFamily: 'var(--font-body)',
              }}
            >
              {item.source}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--muted-soft)', fontFamily: 'var(--font-body)' }}>{ts}</span>
          </div>
          <p
            className="line-clamp-2"
            style={{
              fontSize: '13px', lineHeight: 1.45, fontFamily: 'var(--font-body)',
              color: score > 3 ? 'var(--ink-soft)' : 'var(--muted)',
              margin: '0 0 6px',
            }}
          >
            {item.title}
          </p>
          <div className="rel-bar">
            <div className="rel-fill" style={{ width: rel.width, background: rel.color }} />
          </div>
        </div>
      </div>
    </div>
  )
})

export default function NewsFeed({ items, isLoading, fluid }: { items: ParsedFeedItem[]; isLoading: boolean; fluid?: boolean }) {
  const [tab, setTab] = useState<Tab>('ALL')
  const [q, setQ]     = useState('')

  const scored = useMemo(() =>
    items.map(item => ({
      item,
      score: scoreSignal({ id: item.id, source: item.sourceType as SourceType, text: item.description, title: item.title, date: item.pubDate }).score,
    })).sort((a, b) => b.score !== a.score ? b.score - a.score : new Date(b.item.pubDate).getTime() - new Date(a.item.pubDate).getTime()),
  [items])

  const filtered = useMemo(() => {
    let r = scored
    if (tab !== 'ALL') r = r.filter(({ item }) => {
      if (tab === 'WHO/CDC')  return ['WHO','CDC','ProMED','ECDC'].includes(item.sourceType)
      if (tab === 'NEWS')     return item.sourceType === 'NewsChannel' && !item.isYouTube
      if (tab === 'ACADEMIC') return item.sourceType === 'PubMed'
      if (tab === 'YOUTUBE')  return !!item.isYouTube
      return true
    })
    if (q.trim()) {
      const ql = q.toLowerCase()
      r = r.filter(({ item }) => item.title.toLowerCase().includes(ql) || item.description.toLowerCase().includes(ql))
    }
    return r.slice(0, 100)
  }, [scored, tab, q])

  const tabs: Tab[] = ['ALL', 'WHO/CDC', 'NEWS', 'ACADEMIC', 'YOUTUBE']

  return (
    <div
      className="card flex flex-col h-full overflow-hidden"
      style={fluid ? { flexShrink: 0 } : { width: '300px', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderRight: 'none', flexShrink: 0 }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-0" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <div className="caption-up mb-3">Live Intelligence Feed</div>
        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 12px 8px',
                fontFamily: 'var(--font-body)',
                fontSize: '12px', fontWeight: 500,
                color: tab === t ? 'var(--ink)' : 'var(--muted)',
                borderBottom: tab === t ? '2px solid var(--ink)' : '2px solid transparent',
                background: 'none', marginBottom: '-1px',
                transition: 'color 0.12s',
                whiteSpace: 'nowrap',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <input
          type="text"
          placeholder="Filter signals…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{
            width: '100%', padding: '7px 12px',
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: 'var(--ink)', background: 'var(--canvas-soft)',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 'var(--r-md)', outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--ink-soft)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--hairline-strong)')}
        />
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && !filtered.length ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-2.5" style={{ width: '45%' }} />
                <div className="skeleton h-3" />
                <div className="skeleton h-2.5" style={{ width: '65%' }} />
              </div>
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="p-8 text-center" style={{ color: 'var(--muted-soft)', fontSize: '13px', fontFamily: 'var(--font-body)' }}>
            No signals matching criteria
          </div>
        ) : (
          filtered.map(({ item, score }) => <FeedCard key={item.id} item={item} score={score} />)
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 flex items-center gap-2 shrink-0"
        style={{ borderTop: '1px solid var(--hairline)', background: 'var(--canvas-soft)' }}
      >
        <span
          className="pulse"
          style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sem-success)', display: 'inline-block' }}
        />
        <span style={{ fontSize: '11px', color: 'var(--muted-soft)', fontFamily: 'var(--font-body)' }}>
          {filtered.length} shown · {items.length} total
        </span>
      </div>
    </div>
  )
}
