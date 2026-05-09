export const runtime = 'edge'

const CDC_HANTA_URL = 'https://tools.cdc.gov/api/v2/resources/media/316422.rss'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  try {
    const response = await fetch(CDC_HANTA_URL, {
      headers: {
        'User-Agent': 'HantavirusTracker/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`CDC feed returned ${response.status}`)
    }

    const body = await response.text()

    return new Response(body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=600, stale-while-revalidate=120',
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
