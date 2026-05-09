import type { SourceType } from './threatClassifier'

export interface ParsedFeedItem {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  sourceType: SourceType
  isYouTube?: boolean
  videoId?: string
  thumbnailUrl?: string
}

function getCDATA(xml: string, tag: string): string {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i')
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = cdataRe.exec(xml) || plainRe.exec(xml)
  return m ? m[1].trim() : ''
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractYouTubeId(itemXml: string): string {
  const m = /<yt:videoId>([^<]+)<\/yt:videoId>/i.exec(itemXml)
    || /<media:content[^>]+url="https?:\/\/www\.youtube\.com\/v\/([^"?]+)/i.exec(itemXml)
  return m ? m[1].trim() : ''
}

export function parseRssXml(xml: string, sourceName: string, sourceType: SourceType): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = []
  const isYoutubeFeed = xml.includes('yt:videoId') || xml.includes('youtube.com/feeds')
  const isAtom = xml.includes('<feed') && xml.includes('<entry>')

  if (isAtom) {
    return parseAtomXml(xml, sourceName, sourceType)
  }

  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match
  let idx = 0

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const title = getCDATA(itemXml, 'title')
    const description = stripHtml(getCDATA(itemXml, 'description'))
    const link = getCDATA(itemXml, 'link') || getCDATA(itemXml, 'guid')
    const pubDate = getCDATA(itemXml, 'pubDate')

    if (!title) continue

    const videoId = isYoutubeFeed ? extractYouTubeId(itemXml) : ''

    items.push({
      id: `${sourceName}-${idx}-${pubDate}`,
      title,
      description: description.slice(0, 400),
      link,
      pubDate: pubDate || new Date().toISOString(),
      source: sourceName,
      sourceType,
      isYouTube: isYoutubeFeed,
      videoId: videoId || undefined,
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined,
    })
    idx++
  }
  return items
}

function parseAtomXml(xml: string, sourceName: string, sourceType: SourceType): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi
  let match
  let idx = 0

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1]
    const title = getCDATA(entryXml, 'title')
    const summary = stripHtml(getCDATA(entryXml, 'summary') || getCDATA(entryXml, 'content'))
    const pubDate = getCDATA(entryXml, 'published') || getCDATA(entryXml, 'updated')

    const linkMatch = /<link[^>]+href="([^"]+)"/.exec(entryXml)
      || /<link>([^<]+)<\/link>/.exec(entryXml)
    const link = linkMatch ? linkMatch[1] : ''

    const videoId = extractYouTubeId(entryXml)
    const isYoutube = !!videoId

    if (!title) continue

    items.push({
      id: `${sourceName}-${idx}-${pubDate}`,
      title,
      description: summary.slice(0, 400),
      link,
      pubDate: pubDate || new Date().toISOString(),
      source: sourceName,
      sourceType,
      isYouTube: isYoutube,
      videoId: videoId || undefined,
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined,
    })
    idx++
  }
  return items
}

export async function fetchAndParseFeed(
  proxyBase: string,
  feedUrl: string,
  sourceName: string,
  sourceType: SourceType,
  signal?: AbortSignal
): Promise<ParsedFeedItem[]> {
  const url = `${proxyBase}/api/proxy/rss?url=${encodeURIComponent(feedUrl)}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`)
  const xml = await res.text()
  if (xml.startsWith('{')) throw new Error('Received JSON instead of XML (proxy error)')
  return parseRssXml(xml, sourceName, sourceType)
}
