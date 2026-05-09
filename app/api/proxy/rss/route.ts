export const runtime = 'edge'

export const HANTAVIRUS_FEEDS = {
  WHO_DON: 'https://www.who.int/rss-feeds/news-releases-en.xml',
  CDC_HANTA: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss',
  PROMED: 'https://promedmail.org/feed/',
  RELIEFWEB: 'https://reliefweb.int/updates/rss.xml?primary_country=0&source=1503',
  PUBMED_HANTA: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1lnkOl9eI8OU7U3C6bEY3v6JePWD0G8jYpJHjCR2s_AQfYb44Y/?limit=20&utm_campaign=pubmed-2&fc=20240101000000',
  ECDC: 'https://www.ecdc.europa.eu/en/rss.xml',
  HEALTHMAP: 'https://healthmap.org/en/rss/',
}

export const NEWS_FEEDS = {
  BBC_WORLD: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  REUTERS_HEALTH: 'https://feeds.reuters.com/reuters/healthNews',
  AP_HEALTH: 'https://rsshub.app/ap/topics/health',
  ALJAZEERA: 'https://www.aljazeera.com/xml/rss/all.xml',
  DW_NEWS: 'https://rss.dw.com/rdf/rss-en-all',
  FRANCE24: 'https://www.france24.com/en/rss',
  NDTV: 'https://feeds.feedburner.com/ndtvnews-world-news',
  GUARDIAN: 'https://www.theguardian.com/world/rss',
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const feedUrl = searchParams.get('url')

  if (!feedUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  let decodedUrl: string
  try {
    decodedUrl = decodeURIComponent(feedUrl)
    new URL(decodedUrl)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'HantavirusTracker/1.0 (OSINT Surveillance Dashboard)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Upstream returned ${response.status}` }), {
        status: response.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const contentType = response.headers.get('content-type') || 'application/xml'
    const body = await response.text()

    return new Response(body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType.includes('xml') ? contentType : 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
}
