# HantavirusTracker.cloud

Real-time global hantavirus OSINT surveillance dashboard. A production-grade, serverless intelligence platform monitoring WHO, CDC, ProMED, ECDC, PubMed, and global news feeds with a live CesiumJS 3D globe centrepiece.

**Aesthetic:** Palantir Gotham × Bloomberg Terminal × WorldMonitor.app

## Deploy in 60 seconds

```bash
# 1. Clone repo
git clone https://github.com/tahirmahm/hantavirustracker.cloud
cd hantavirustracker.cloud

# 2. Install dependencies
npm install

# 3. Add your free Cesium ion token to .env.local
echo "NEXT_PUBLIC_CESIUM_TOKEN=your_token_here" > .env.local
# Get a free token at https://ion.cesium.com (free tier is sufficient)

# 4. Deploy to Vercel
vercel deploy

# 5. Add custom domain in Vercel dashboard: hantavirustracker.cloud
```

**No other environment variables required.** All data is fetched from public sources via edge function proxies.

## Architecture

```
Zero backend · Zero auth · Zero database
Everything runs on Vercel Edge Functions + React client
```

```
Next.js 14 App Router
├── /app
│   ├── page.tsx                    ← Full-screen dashboard shell
│   ├── layout.tsx                  ← Root layout, CesiumJS CDN load
│   └── api/proxy/
│       ├── rss/route.ts            ← Universal RSS feed proxy (edge)
│       ├── who/route.ts            ← WHO Disease Outbreak News (edge)
│       ├── cdc/route.ts            ← CDC hantavirus data (edge)
│       └── news/route.ts           ← News aggregator (edge)
├── /components
│   ├── Dashboard.tsx               ← Main dashboard shell
│   ├── Globe.tsx                   ← CesiumJS 3D globe
│   ├── AlertBanner.tsx             ← Top scrolling threat ticker
│   ├── MetricsPanel.tsx            ← Left sidebar intelligence panel
│   ├── NewsFeed.tsx                ← Live feed panel (right)
│   ├── TerminalLog.tsx             ← Bottom live event log
│   ├── ThreatMatrix.tsx            ← Threat level visualization
│   ├── ConvergenceEngine.tsx       ← Multi-source convergence alerts
│   └── LoadingScreen.tsx           ← Typewriter boot sequence
├── /lib
│   ├── feedParser.ts               ← RSS/Atom parser (client-safe)
│   ├── threatClassifier.ts         ← Client-side threat scoring engine
│   ├── geoResolver.ts              ← Country/region → lat/lng (200 entries)
│   ├── cesiumConfig.ts             ← CesiumJS configuration
│   └── cache.ts                    ← localStorage TTL cache
└── /hooks
    └── useDataRefresh.ts           ← Parallel feed polling + state
```

## Features

### Intelligence Sources
| Source | Interval | Type |
|--------|----------|------|
| WHO Disease Outbreak News | 5 min | Health surveillance |
| CDC Hantavirus | 10 min | Health surveillance |
| ProMED Mail | 5 min | Disease outbreak network |
| ECDC | 15 min | European surveillance |
| PubMed Hantavirus | 30 min | Academic literature |
| BBC, Al Jazeera, DW, Guardian, France 24 | 2 min | Global news |
| WHO YouTube, CDC YouTube | 2 min | Official video |

### Threat Classification Engine
Pure deterministic client-side scoring:
- **Keyword weights**: High (hantavirus keywords: 10pts), Medium (outbreak terms: 5pts), Contextual (rodent vectors: 3pts)
- **Amplifiers**: Warning/emergency terms → 2× multiplier
- **Source credibility**: WHO=1.0, CDC=0.95, ProMED=0.9, ECDC=0.85, PubMed=0.8
- **Temporal decay**: Last 24h = 1.5× boost, older than 7 days decay at 10%/day
- **Convergence detection**: 3+ independent sources on same location within 72h → +30% boost

### Threat Levels
| Score | Level | Color |
|-------|-------|-------|
| 0-10 | MINIMAL | Green |
| 11-25 | LOW | Cyan |
| 26-45 | MODERATE | Yellow |
| 46-65 | ELEVATED | Orange |
| 66-80 | HIGH | Red |
| 81-100 | CRITICAL | Crimson (pulsing) |

### Globe Layers
- **Hotspots**: Pulsing point markers color-coded by threat level
- **Heatmap**: Semi-transparent ellipses radiating from hotspot centers  
- **Signal Arcs**: Animated arcs showing new signal propagation
- **Labels**: Country name overlays at hotspot locations
- Auto-rotation with user interaction pause/resume

## Design System

**Fonts**: Orbitron (metrics/scores) · Rajdhani (UI labels) · Share Tech Mono (terminal/data)

**Palette**: Palantir dark room — deep navy/black panels, cyan accents, threat-level spectrum from green to crimson

**Effects**: CRT scanline overlay · Panel HUD corner brackets · Threat pulse animations · Terminal cursor blink

## Local Development

```bash
npm run dev
# Open http://localhost:3000
```

Requires Node.js 18+. Minimum viewport: 1280px (command-centre app).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CESIUM_TOKEN` | Optional | Cesium ion token for terrain/imagery. Free tier works. Without it, falls back to OpenStreetMap. |

## Tech Stack

- **Next.js 14** App Router + TypeScript
- **CesiumJS 1.112** (CDN, not npm — keeps bundle lean)
- **Tailwind CSS 4**
- **fast-xml-parser** for RSS/Atom parsing
- **date-fns** for timestamps
- **Vercel Edge Functions** for CORS proxying
- All threat logic runs **client-side** — no backend AI/ML APIs needed
