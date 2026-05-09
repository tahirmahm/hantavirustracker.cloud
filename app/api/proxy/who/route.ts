export const runtime = 'edge'

const WHO_DON_URL = 'https://www.who.int/emergencies/disease-outbreak-news/rss2.xml'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

interface WHOItem {
  title: string
  pubDate: string
  link: string
  description: string
  guid: string
}

function parseWHOXml(xml: string): WHOItem[] {
  const items: WHOItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const get = (tag: string) => {
      const m = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i').exec(itemXml)
        || new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(itemXml)
      return m ? m[1].trim() : ''
    }
    items.push({
      title: get('title'),
      pubDate: get('pubDate'),
      link: get('link'),
      description: get('description'),
      guid: get('guid'),
    })
  }
  return items
}

export async function GET() {
  try {
    const response = await fetch(WHO_DON_URL, {
      headers: {
        'User-Agent': 'HantavirusTracker/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`WHO feed returned ${response.status}`)
    }

    const xml = await response.text()
    const items = parseWHOXml(xml)

    return new Response(JSON.stringify({ items, fetchedAt: new Date().toISOString() }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return new Response(JSON.stringify({ error: message, items: [] }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
}
