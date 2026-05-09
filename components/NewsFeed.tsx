'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import type { ParsedFeedItem } from '@/lib/feedParser'
import { scoreSignal } from '@/lib/threatClassifier'
import type { SourceType } from '@/lib/threatClassifier'
import { formatDistanceToNow } from 'date-fns'

type FeedTab = 'ALL' | 'WHO/CDC' | 'NEWS' | 'ACADEMIC' | 'YOUTUBE'

const SOURCE_TYPE_COLORS: Record<string, string> = {
  WHO: '#1A6EBD',
  CDC: '#1A9BD4',
  ProMED: '#FF8000',
  ECDC: '#003F87',
  PubMed: '#9B59B6',
  NewsChannel: '#4CAF50',
  HealthMap: '#E8002D',
  ReliefWeb: '#E63B2E',
}

const SOURCE_COLORS: Record<string, string> = {
  'BBC World': '#BB1919',
  'Al Jazeera': '#4CAF50',
  'DW News': '#0066CC',
  'France 24': '#003F87',
  'Guardian': '#005689',
  'WHO DON': '#1A6EBD',
  'CDC Hantavirus': '#1A9BD4',
  'ProMED Mail': '#FF8000',
  'ECDC': '#003F87',
  'PubMed': '#9B59B6',
  'WHO YouTube': '#FF0000',
  'CDC YouTube': '#FF0000',
}

function getSourceColor(item: ParsedFeedItem): string {
  return SOURCE_COLORS[item.source] || SOURCE_TYPE_COLORS[item.sourceType] || '#4a5568'
}

function getRelBar(score: number): { width: string; color: string } {
  if (score >= 60) return { width: `${score}%`, color: '#ff2040' }
  if (score >= 30) return { width: `${score}%`, color: '#ff6b00' }
  if (score >= 10) return { width: `${score}%`, color: '#f0c040' }
  return { width: `${Math.max(5, score)}%`, color: '#1a2535' }
}

const FeedCard = memo(function FeedCard({ item, score }: { item: ParsedFeedItem; score: number }) {
  const rel = getRelBar(score)
  const color = getSourceColor(item)
  const isHighRelevance = score > 15

  let timeStr = ''
  try {
    timeStr = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })
  } catch { /* ignore */ }

  const handleClick = useCallback(() => {
    if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer')
  }, [item.link])

  return (
    <div
      className="feed-card p-2 mx-2 mb-1 rounded fade-in"
      style={{
        border: isHighRelevance
          ? '1px solid rgba(255,32,64,0.4)'
          : '1px solid rgba(26,37,53,0.6)',
        background: isHighRelevance ? 'rgba(255,32,64,0.04)' : 'transparent',
        cursor: item.link ? 'pointer' : 'default',
      }}
      onClick={handleClick}
      role={item.link ? 'link' : undefined}
      tabIndex={item.link ? 0 : undefined}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <div className="flex items-start gap-2">
        {/* YouTube thumbnail */}
        {item.isYouTube && item.thumbnailUrl && (
          <img
            src={item.thumbnailUrl}
            alt=""
            className="shrink-0 rounded"
            style={{ width: '64px', height: '36px', objectFit: 'cover', opacity: 0.8 }}
            loading="lazy"
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Source + time row */}
          <div className="flex items-center gap-1 mb-1">
            <span
              className="font-terminal text-xs px-1 rounded shrink-0"
              style={{
                background: `${color}22`,
                color,
                border: `1px solid ${color}44`,
                fontSize: '10px',
              }}
            >
              {item.source}
            </span>
            <span className="font-terminal shrink-0" style={{ fontSize: '10px', color: '#4a5568' }}>
              {timeStr}
            </span>
          </div>

          {/* Title */}
          <div
            className="font-terminal text-xs leading-tight mb-1 line-clamp-2"
            style={{ color: score > 5 ? '#e8edf5' : '#8a9ab5' }}
          >
            {item.title}
          </div>

          {/* Relevance bar */}
          <div className="relevance-bar">
            <div className="relevance-fill" style={{ width: rel.width, background: rel.color }} />
          </div>
        </div>
      </div>
    </div>
  )
})

interface NewsFeedProps {
  items: ParsedFeedItem[]
  isLoading: boolean
}

export default function NewsFeed({ items, isLoading }: NewsFeedProps) {
  const [tab, setTab] = useState<FeedTab>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const scoredItems = useMemo(() => {
    return items.map(item => {
      const signal = {
        id: item.id,
        source: item.sourceType as SourceType,
        text: item.description,
        title: item.title,
        date: item.pubDate,
      }
      const scored = scoreSignal(signal)
      return { item, score: scored.score }
    }).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(b.item.pubDate).getTime() - new Date(a.item.pubDate).getTime()
    })
  }, [items])

  const filtered = useMemo(() => {
    let result = scoredItems

    if (tab !== 'ALL') {
      result = result.filter(({ item }) => {
        if (tab === 'WHO/CDC') return item.sourceType === 'WHO' || item.sourceType === 'CDC' || item.sourceType === 'ProMED' || item.sourceType === 'ECDC'
        if (tab === 'NEWS') return item.sourceType === 'NewsChannel' && !item.isYouTube
        if (tab === 'ACADEMIC') return item.sourceType === 'PubMed'
        if (tab === 'YOUTUBE') return item.isYouTube
        return true
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(({ item }) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
      )
    }

    return result.slice(0, 100)
  }, [scoredItems, tab, searchQuery])

  const tabs: FeedTab[] = ['ALL', 'WHO/CDC', 'NEWS', 'ACADEMIC', 'YOUTUBE']

  return (
    <div
      className="panel panel-corners flex flex-col h-full overflow-hidden"
      style={{ width: '320px', borderLeft: '1px solid var(--bg-panel-border)' }}
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
        LIVE INTELLIGENCE FEED
      </div>

      {/* Tabs */}
      <div
        className="flex shrink-0 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--bg-panel-border)' }}
      >
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-2 font-terminal text-xs whitespace-nowrap transition-colors"
            style={{
              color: tab === t ? '#00d4ff' : '#4a5568',
              borderBottom: tab === t ? '1px solid #00d4ff' : '1px solid transparent',
              background: tab === t ? 'rgba(0,212,255,0.06)' : 'transparent',
              marginBottom: '-1px',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-2 shrink-0" style={{ borderBottom: '1px solid var(--bg-panel-border)' }}>
        <input
          type="text"
          placeholder="FILTER SIGNALS..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full font-terminal text-xs px-2 py-1 rounded"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--bg-panel-border)',
            color: '#e8edf5',
            outline: 'none',
          }}
        />
      </div>

      {/* Feed items */}
      <div className="flex-1 overflow-y-auto py-1" style={{ scrollBehavior: 'smooth' }}>
        {isLoading && filtered.length === 0 ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="skeleton h-3 rounded" style={{ width: '60%' }} />
                <div className="skeleton h-3 rounded" />
                <div className="skeleton h-2 rounded" style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center font-terminal text-xs" style={{ color: '#4a5568' }}>
            NO SIGNALS MATCHING CRITERIA
          </div>
        ) : (
          filtered.map(({ item, score }) => (
            <FeedCard key={item.id} item={item} score={score} />
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2 font-terminal shrink-0 flex items-center gap-2"
        style={{
          fontSize: '10px',
          color: '#4a5568',
          borderTop: '1px solid var(--bg-panel-border)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full dot-live"
          style={{ background: '#00ff88', boxShadow: '0 0 4px #00ff88' }}
        />
        {filtered.length} SIGNALS · {items.length} TOTAL
      </div>
    </div>
  )
}
