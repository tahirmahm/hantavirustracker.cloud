'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchAndParseFeed, type ParsedFeedItem } from '@/lib/feedParser'
import { computeThreatAssessment, type ThreatAssessment, type ThreatSignal, type SourceType } from '@/lib/threatClassifier'
import { getCached, setCached } from '@/lib/cache'

const REFRESH_INTERVALS = {
  WHO_DON: 5 * 60 * 1000,
  CDC: 10 * 60 * 1000,
  PROMED: 5 * 60 * 1000,
  ECDC: 15 * 60 * 1000,
  PUBMED: 30 * 60 * 1000,
  NEWS: 2 * 60 * 1000,
}

export interface FeedSource {
  key: string
  name: string
  url: string
  sourceType: SourceType
  color: string
  interval: number
  category: 'health' | 'news' | 'academic' | 'youtube'
}

export const FEED_SOURCES: FeedSource[] = [
  {
    key: 'WHO_DON',
    name: 'WHO DON',
    url: 'https://www.who.int/rss-feeds/news-releases-en.xml',
    sourceType: 'WHO',
    color: '#1A6EBD',
    interval: REFRESH_INTERVALS.WHO_DON,
    category: 'health',
  },
  {
    key: 'CDC_HANTA',
    name: 'CDC Hantavirus',
    url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss',
    sourceType: 'CDC',
    color: '#1A6EBD',
    interval: REFRESH_INTERVALS.CDC,
    category: 'health',
  },
  {
    key: 'PROMED',
    name: 'ProMED Mail',
    url: 'https://promedmail.org/feed/',
    sourceType: 'ProMED',
    color: '#FF8000',
    interval: REFRESH_INTERVALS.PROMED,
    category: 'health',
  },
  {
    key: 'ECDC',
    name: 'ECDC',
    url: 'https://www.ecdc.europa.eu/en/rss.xml',
    sourceType: 'ECDC',
    color: '#003F87',
    interval: REFRESH_INTERVALS.ECDC,
    category: 'health',
  },
  {
    key: 'PUBMED',
    name: 'PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1lnkOl9eI8OU7U3C6bEY3v6JePWD0G8jYpJHjCR2s_AQfYb44Y/?limit=20&utm_campaign=pubmed-2&fc=20240101000000',
    sourceType: 'PubMed',
    color: '#9B59B6',
    interval: REFRESH_INTERVALS.PUBMED,
    category: 'academic',
  },
  {
    key: 'BBC',
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    sourceType: 'NewsChannel',
    color: '#BB1919',
    interval: REFRESH_INTERVALS.NEWS,
    category: 'news',
  },
  {
    key: 'ALJAZEERA',
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    sourceType: 'NewsChannel',
    color: '#4CAF50',
    interval: REFRESH_INTERVALS.NEWS,
    category: 'news',
  },
  {
    key: 'DW',
    name: 'DW News',
    url: 'https://rss.dw.com/rdf/rss-en-all',
    sourceType: 'NewsChannel',
    color: '#0066CC',
    interval: REFRESH_INTERVALS.NEWS,
    category: 'news',
  },
  {
    key: 'GUARDIAN',
    name: 'Guardian',
    url: 'https://www.theguardian.com/world/rss',
    sourceType: 'NewsChannel',
    color: '#005689',
    interval: REFRESH_INTERVALS.NEWS,
    category: 'news',
  },
  {
    key: 'FRANCE24',
    name: 'France 24',
    url: 'https://www.france24.com/en/rss',
    sourceType: 'NewsChannel',
    color: '#003F87',
    interval: REFRESH_INTERVALS.NEWS,
    category: 'news',
  },
  {
    key: 'WHO_YT',
    name: 'WHO YouTube',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCT3L-4FxOMKdXL5OkN8mupw',
    sourceType: 'WHO',
    color: '#1A6EBD',
    interval: REFRESH_INTERVALS.NEWS,
    category: 'youtube',
  },
  {
    key: 'CDC_YT',
    name: 'CDC YouTube',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCb4FnkN4LVgPSuQfNW0tHVA',
    sourceType: 'CDC',
    color: '#1A6EBD',
    interval: REFRESH_INTERVALS.NEWS,
    category: 'youtube',
  },
]

export type FeedStatus = 'idle' | 'loading' | 'live' | 'stale' | 'error'

export interface SourceStatus {
  key: string
  name: string
  status: FeedStatus
  lastFetch?: number
  itemCount: number
  color: string
}

export interface DashboardState {
  allItems: ParsedFeedItem[]
  assessment: ThreatAssessment | null
  sourceStatuses: SourceStatus[]
  terminalLog: string[]
  isInitialLoad: boolean
  hourlyActivity: number[]
}

const MAX_LOG_LINES = 200

function addLog(prev: string[], line: string): string[] {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const newLog = [...prev, `[${ts}] ${line}`]
  return newLog.length > MAX_LOG_LINES ? newLog.slice(-MAX_LOG_LINES) : newLog
}

function buildSignals(items: ParsedFeedItem[]): ThreatSignal[] {
  return items.map((item, i) => ({
    id: item.id || `item-${i}`,
    source: item.sourceType,
    text: item.description,
    title: item.title,
    date: item.pubDate,
    url: item.link,
  }))
}

function computeHourlyActivity(items: ParsedFeedItem[]): number[] {
  const counts = new Array(24).fill(0)
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  for (const item of items) {
    const age = now - new Date(item.pubDate).getTime()
    if (age < dayMs) {
      const hourIndex = Math.floor(age / (60 * 60 * 1000))
      if (hourIndex < 24) counts[23 - hourIndex]++
    }
  }
  return counts
}

export function useDataRefresh() {
  const [state, setState] = useState<DashboardState>({
    allItems: [],
    assessment: null,
    sourceStatuses: FEED_SOURCES.map(s => ({
      key: s.key,
      name: s.name,
      status: 'idle',
      itemCount: 0,
      color: s.color,
    })),
    terminalLog: [],
    isInitialLoad: true,
    hourlyActivity: new Array(24).fill(0),
  })

  const allItemsRef = useRef<Map<string, ParsedFeedItem>>(new Map())
  const abortControllers = useRef<Map<string, AbortController>>(new Map())

  const updateSourceStatus = useCallback((key: string, update: Partial<SourceStatus>) => {
    setState(prev => ({
      ...prev,
      sourceStatuses: prev.sourceStatuses.map(s =>
        s.key === key ? { ...s, ...update } : s
      ),
    }))
  }, [])

  const appendLog = useCallback((line: string) => {
    setState(prev => ({ ...prev, terminalLog: addLog(prev.terminalLog, line) }))
  }, [])

  const refreshFeed = useCallback(async (source: FeedSource, stagger = 0) => {
    if (stagger > 0) await new Promise(r => setTimeout(r, stagger))

    // Cancel previous request for this source
    abortControllers.current.get(source.key)?.abort()
    const ctrl = new AbortController()
    abortControllers.current.set(source.key, ctrl)

    updateSourceStatus(source.key, { status: 'loading' })

    try {
      const cached = getCached<ParsedFeedItem[]>(`feed_${source.key}`, source.interval)
      let items: ParsedFeedItem[]

      if (cached) {
        items = cached
        appendLog(`${source.name} » Cache hit · ${items.length} items`)
      } else {
        items = await fetchAndParseFeed('', source.url, source.name, source.sourceType, ctrl.signal)
        setCached(`feed_${source.key}`, items, source.interval)
      }

      // Merge items (deduplicate by id)
      for (const item of items) {
        allItemsRef.current.set(item.id, item)
      }

      const allItems = [...allItemsRef.current.values()]
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, 500)

      // Recompute assessment when we have enough data
      const signals = buildSignals(allItems)
      const assessment = computeThreatAssessment(signals)

      const relevant = items.filter(item =>
        [item.title, item.description].some(t =>
          /hantavirus|hantaan|sin nombre|puumala|andes virus|HPS|HFRS|outbreak|rodent/i.test(t)
        )
      ).length

      appendLog(
        `${source.name} » Fetched ${items.length} items · ${relevant} relevant · Score delta: +${assessment.threatScore}`
      )

      setState(prev => ({
        ...prev,
        allItems,
        assessment,
        isInitialLoad: false,
        hourlyActivity: computeHourlyActivity(allItems),
        sourceStatuses: prev.sourceStatuses.map(s =>
          s.key === source.key
            ? { ...s, status: 'live', lastFetch: Date.now(), itemCount: items.length }
            : s
        ),
      }))
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      appendLog(`${source.name} » ERROR: ${(err as Error).message}`)
      updateSourceStatus(source.key, { status: 'error' })
    }
  }, [appendLog, updateSourceStatus])

  // Initial load: fetch all sources in parallel with slight stagger
  useEffect(() => {
    appendLog('SYSTEM INIT » HantavirusTracker.cloud starting up...')
    appendLog('SYSTEM INIT » Loading all intelligence feeds...')

    FEED_SOURCES.forEach((source, idx) => {
      refreshFeed(source, idx * 200)
    })

    // Set up periodic refresh
    const timers: ReturnType<typeof setInterval>[] = []
    FEED_SOURCES.forEach(source => {
      const timer = setInterval(() => refreshFeed(source), source.interval)
      timers.push(timer)
    })

    // Stale checker — mark sources stale if not refreshed in 1h
    const staleChecker = setInterval(() => {
      setState(prev => ({
        ...prev,
        sourceStatuses: prev.sourceStatuses.map(s => {
          if (s.status === 'live' && s.lastFetch && Date.now() - s.lastFetch > 60 * 60 * 1000) {
            return { ...s, status: 'stale' }
          }
          return s
        }),
      }))
    }, 60 * 1000)

    return () => {
      timers.forEach(clearInterval)
      clearInterval(staleChecker)
      abortControllers.current.forEach(ctrl => ctrl.abort())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic re-assessment log
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.assessment) {
        appendLog(
          `REFRESH CYCLE » All feeds polled. Global score: ${state.assessment.threatScore} (${state.assessment.globalThreatLevel}). Next poll: 60s`
        )
      }
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [state.assessment, appendLog])

  return state
}
