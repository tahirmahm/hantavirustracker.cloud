export const runtime = 'edge'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export interface NewsItem {
  id: string
  title: string
  source: string
  publishedAt: string
  url: string
  description: string
  relevanceScore: number
  geoTag?: { country: string; lat: number; lng: number }
}

const RSS_NEWS_FEEDS = [
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'DW News', url: 'https://rss.dw.com/rdf/rss-en-all' },
  { name: 'Guardian', url: 'https://www.theguardian.com/world/rss' },
]

function extractText(xml: string, tag: string): string {
  const m = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i').exec(xml)
    || new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(xml)
  return m ? m[1].trim() : ''
}

function parseItems(xml: string, sourceName: string): NewsItem[] {
  const items: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match
  let idx = 0

  while ((match = itemRegex.exec(xml)) !== null && idx < 30) {
    const itemXml = match[1]
    const title = extractText(itemXml, 'title')
    const link = extractText(itemXml, 'link') || extractText(itemXml, 'guid')
    const pubDate = extractText(itemXml, 'pubDate')
    const description = extractText(itemXml, 'description')

    if (!title) continue

    items.push({
      id: `${sourceName}-${idx}-${Date.now()}`,
      title,
      source: sourceName,
      publishedAt: pubDate || new Date().toISOString(),
      url: link,
      description: description.replace(/<[^>]+>/g, '').slice(0, 300),
      relevanceScore: 0,
    })
    idx++
  }
  return items
}

async function fetchFeed(url: string, name: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HantavirusTracker/1.0', 'Accept': 'application/rss+xml, text/xml, */*' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseItems(xml, name)
  } catch {
    return []
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || 'hantavirus'

  const results = await Promise.allSettled(
    RSS_NEWS_FEEDS.map(f => fetchFeed(f.url, f.name))
  )

  const allItems: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') allItems.push(...r.value)
  }

  const qLower = q.toLowerCase()
  const scored = allItems.map(item => ({
    ...item,
    relevanceScore: [item.title, item.description].some(t =>
      t.toLowerCase().includes(qLower)
    ) ? 80 : 10,
  }))

  scored.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return new Response(JSON.stringify({ items: scored.slice(0, 60), fetchedAt: new Date().toISOString() }), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
    },
  })
}
