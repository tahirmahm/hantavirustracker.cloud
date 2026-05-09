'use client'

import { useEffect, useRef, useState } from 'react'
import type { GeoHotspot } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'

interface MapProps {
  hotspots: GeoHotspot[]
  onHotspotClick?: (hotspot: GeoHotspot) => void
  newSignalLocation?: { lat: number; lng: number; source: string } | null
}

declare global {
  interface Window {
    L: any
  }
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'

export default function Map2D({ hotspots, onHotspotClick }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const circlesRef = useRef<any[]>([])
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<GeoHotspot | null>(null)

  // Init map
  useEffect(() => {
    if (!containerRef.current) return
    let map: any

    const init = () => {
      const L = window.L
      if (!L) return

      map = L.map(containerRef.current, {
        center: [20, 10],
        zoom: 2,
        minZoom: 1,
        maxZoom: 10,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTR,
        subdomains: 'abcd',
        maxZoom: 20,
        opacity: 0.85,
      }).addTo(map)

      // Minimal zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Subtle attribution bottom-right
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution(TILE_ATTR)
        .addTo(map)

      mapRef.current = map
      setReady(true)
    }

    // Load Leaflet CSS + JS if not already loaded
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = init
      document.head.appendChild(script)
    } else if (window.L) {
      init()
    } else {
      const interval = setInterval(() => {
        if (window.L) { clearInterval(interval); init() }
      }, 100)
    }

    return () => {
      if (map) map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when hotspots change
  useEffect(() => {
    if (!ready || !mapRef.current) return
    const L = window.L
    const map = mapRef.current

    // Remove old markers
    markersRef.current.forEach(m => map.removeLayer(m))
    circlesRef.current.forEach(c => map.removeLayer(c))
    markersRef.current = []
    circlesRef.current = []

    for (const hs of hotspots) {
      const color = getThreatColor(hs.threatLevel)
      const radius = Math.max(4, hs.intensity * 12 + 4)

      // Heatmap circle
      const circle = L.circle([hs.lat, hs.lng], {
        radius: Math.max(150000, hs.intensity * 600000),
        color,
        fillColor: color,
        fillOpacity: 0.07,
        weight: 1,
        opacity: 0.25,
      }).addTo(map)
      circlesRef.current.push(circle)

      // Marker dot
      const icon = L.divIcon({
        html: `<div style="
          width:${radius * 2}px;
          height:${radius * 2}px;
          border-radius:50%;
          background:${color};
          opacity:0.85;
          border:1.5px solid ${color}44;
          box-shadow:0 0 6px ${color}55;
        "></div>`,
        className: '',
        iconSize: [radius * 2, radius * 2],
        iconAnchor: [radius, radius],
      })

      const marker = L.marker([hs.lat, hs.lng], { icon })
        .addTo(map)
        .on('click', () => {
          setSelected(hs)
          onHotspotClick?.(hs)
          map.setView([hs.lat, hs.lng], Math.max(map.getZoom(), 4), { animate: true, duration: 0.8 })
        })

      markersRef.current.push(marker)
    }
  }, [hotspots, ready, onHotspotClick])

  return (
    <div className="relative w-full h-full" style={{ background: '#0d1117' }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Selected hotspot panel */}
      {selected && (
        <div
          className="absolute top-3 left-3 z-[1000] p-3 rounded"
          style={{
            background: 'rgba(15,20,30,0.95)',
            border: '1px solid #2a3446',
            minWidth: '180px',
            maxWidth: '220px',
          }}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 text-xs"
            style={{ color: '#64748b', lineHeight: 1 }}
          >
            ×
          </button>
          <div className="font-ui font-semibold text-sm mb-1" style={{ color: getThreatColor(selected.threatLevel) }}>
            {selected.country}
          </div>
          <div className="space-y-1 mt-2">
            {[
              ['Threat', selected.threatLevel],
              ['Score', Math.round(selected.score)],
              ['Signals', selected.signalCount],
              ['Sources', selected.sources.join(', ')],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-3 text-xs font-terminal">
                <span style={{ color: '#64748b' }}>{k}</span>
                <span style={{ color: '#c8d0e0' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center z-[500]" style={{ background: '#0d1117' }}>
          <span className="text-xs font-terminal" style={{ color: '#64748b' }}>Loading map…</span>
        </div>
      )}
    </div>
  )
}
