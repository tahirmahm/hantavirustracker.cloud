'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { GeoHotspot, ThreatLevel } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'
import { CESIUM_ION_TOKEN, GLOBE_CONFIG } from '@/lib/cesiumConfig'

declare const Cesium: any

interface GlobeProps {
  hotspots: GeoHotspot[]
  onHotspotClick?: (hotspot: GeoHotspot) => void
  newSignalLocation?: { lat: number; lng: number; source: string } | null
}

interface LayerToggles {
  hotspots: boolean
  heatmap: boolean
  arcs: boolean
  labels: boolean
}

function getThreatPixelSize(intensity: number): number {
  return Math.max(8, Math.min(28, intensity * 20 + 8))
}

export default function Globe({ hotspots, onHotspotClick, newSignalLocation }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const pointCollRef = useRef<any>(null)
  const ellipseCollRef = useRef<any>(null)
  const arcCollRef = useRef<any>(null)
  const labelsCollRef = useRef<any>(null)
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRotatingRef = useRef(true)
  const [ready, setReady] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<GeoHotspot | null>(null)
  const [layers, setLayers] = useState<LayerToggles>({
    hotspots: true,
    heatmap: true,
    arcs: true,
    labels: true,
  })

  const startRotation = useCallback(() => {
    if (rotationRef.current || !viewerRef.current) return
    isRotatingRef.current = true
    rotationRef.current = setInterval(() => {
      if (!viewerRef.current || !isRotatingRef.current) return
      try {
        viewerRef.current.scene.camera.rotate(
          Cesium.Cartesian3.UNIT_Z,
          -GLOBE_CONFIG.autoRotateSpeed * (Math.PI / 180)
        )
      } catch { /* ignore during unmount */ }
    }, 16)
  }, [])

  const stopRotation = useCallback(() => {
    isRotatingRef.current = false
    if (rotationRef.current) {
      clearInterval(rotationRef.current)
      rotationRef.current = null
    }
  }, [])

  const scheduleResumeRotation = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(startRotation, GLOBE_CONFIG.autoRotateResumeDelay)
  }, [startRotation])

  useEffect(() => {
    if (!containerRef.current || typeof Cesium === 'undefined') return

    let viewer: any

    const init = async () => {
      try {
        if (CESIUM_ION_TOKEN) {
          Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN
        }

        viewer = new Cesium.Viewer(containerRef.current, {
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          creditContainer: document.createElement('div'),
          imageryProvider: new Cesium.OpenStreetMapImageryProvider({
            url: 'https://tile.openstreetmap.org/',
          }),
        })

        // Dark globe style
        viewer.scene.backgroundColor = Cesium.Color.BLACK
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a0e1a')
        viewer.scene.globe.enableLighting = false
        viewer.scene.globe.atmosphereHueShift = -0.1
        viewer.scene.globe.atmosphereSaturationShift = -0.8
        viewer.scene.globe.atmosphereBrightnessShift = -0.5
        viewer.scene.globe.showGroundAtmosphere = false

        // Dark imagery layer
        viewer.scene.imageryLayers.get(0).brightness = 0.3
        viewer.scene.imageryLayers.get(0).contrast = 1.8
        viewer.scene.imageryLayers.get(0).saturation = 0.1
        viewer.scene.imageryLayers.get(0).hue = 0.6

        // Initial camera
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(20, 20, 22000000),
        })

        // Primitives collections
        pointCollRef.current = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection())
        labelsCollRef.current = viewer.scene.primitives.add(new Cesium.LabelCollection())
        arcCollRef.current = viewer.scene.primitives.add(new Cesium.PolylineCollection())

        viewerRef.current = viewer

        // User interaction stops rotation
        const stopAndSchedule = () => {
          stopRotation()
          scheduleResumeRotation()
        }

        viewer.scene.canvas.addEventListener('mousedown', stopAndSchedule)
        viewer.scene.canvas.addEventListener('wheel', stopAndSchedule)
        viewer.scene.canvas.addEventListener('touchstart', stopAndSchedule)

        // Click handler for hotspot selection
        viewer.screenSpaceEventHandler.setInputAction((click: any) => {
          const pickedObject = viewer.scene.pick(click.position)
          if (pickedObject?.id?.hotspot) {
            const hs = pickedObject.id.hotspot as GeoHotspot
            setSelectedHotspot(hs)
            onHotspotClick?.(hs)
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(hs.lng, hs.lat, GLOBE_CONFIG.hotspotFlyAltitude),
              duration: GLOBE_CONFIG.flyToDuration,
            })
          } else {
            setSelectedHotspot(null)
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        setReady(true)
        startRotation()
      } catch (err) {
        console.error('Cesium init error:', err)
      }
    }

    // Wait for Cesium to be available
    const waitForCesium = setInterval(() => {
      if (typeof Cesium !== 'undefined') {
        clearInterval(waitForCesium)
        init()
      }
    }, 100)

    return () => {
      clearInterval(waitForCesium)
      stopRotation()
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update hotspot markers
  useEffect(() => {
    if (!ready || !viewerRef.current || !pointCollRef.current) return
    const viewer = viewerRef.current

    try {
      // Clear existing
      pointCollRef.current.removeAll()
      labelsCollRef.current?.removeAll()
      viewer.entities.removeAll()

      if (!layers.hotspots) return

      for (const hs of hotspots) {
        const color = Cesium.Color.fromCssColorString(getThreatColor(hs.threatLevel))
        const pixelSize = getThreatPixelSize(hs.intensity)

        pointCollRef.current.add({
          position: Cesium.Cartesian3.fromDegrees(hs.lng, hs.lat),
          pixelSize,
          color: color.withAlpha(0.9),
          outlineColor: color.withAlpha(0.4),
          outlineWidth: 2,
          id: { hotspot: hs },
        })

        // Pulsing ellipse for HIGH/CRITICAL
        if (layers.heatmap && (hs.threatLevel === 'HIGH' || hs.threatLevel === 'CRITICAL' || hs.threatLevel === 'ELEVATED')) {
          const radiusKm = Math.max(200, hs.intensity * 800)
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(hs.lng, hs.lat),
            ellipse: {
              semiMinorAxis: radiusKm * 1000,
              semiMajorAxis: radiusKm * 1000,
              material: Cesium.Color.fromCssColorString(getThreatColor(hs.threatLevel)).withAlpha(0.08),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString(getThreatColor(hs.threatLevel)).withAlpha(0.3),
              outlineWidth: 1,
            },
          })
        }

        // Labels
        if (layers.labels && labelsCollRef.current) {
          labelsCollRef.current.add({
            position: Cesium.Cartesian3.fromDegrees(hs.lng, hs.lat + 2),
            text: hs.country,
            font: '11px "Share Tech Mono", monospace',
            fillColor: Cesium.Color.fromCssColorString(getThreatColor(hs.threatLevel)),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            scale: 1.0,
          })
        }
      }
    } catch (err) {
      console.warn('Globe render error:', err)
    }
  }, [hotspots, ready, layers])

  // Animate new signal arc
  useEffect(() => {
    if (!ready || !newSignalLocation || !arcCollRef.current || hotspots.length === 0) return
    if (!layers.arcs) return

    const src = newSignalLocation
    const targets = hotspots.slice(0, 3)

    try {
      for (const target of targets) {
        const arcId = arcCollRef.current.add({
          positions: Cesium.Cartesian3.fromDegreesArray([
            src.lng, src.lat,
            (src.lng + target.lng) / 2, Math.max(src.lat, target.lat) + 15,
            target.lng, target.lat,
          ]),
          width: 1.5,
          material: new Cesium.PolylineGlowMaterialProperty
            ? Cesium.Material.fromType('PolylineGlow', {
                glowPower: 0.3,
                color: Cesium.Color.fromCssColorString('#00d4ff').withAlpha(0.7),
              })
            : Cesium.Material.fromType('Color', {
                color: Cesium.Color.fromCssColorString('#00d4ff').withAlpha(0.7),
              }),
        })

        setTimeout(() => {
          if (arcCollRef.current && !viewerRef.current?.isDestroyed()) {
            try { arcCollRef.current.remove(arcId) } catch { /* ignore */ }
          }
        }, GLOBE_CONFIG.arcDuration)
      }
    } catch (err) {
      console.warn('Arc error:', err)
    }
  }, [newSignalLocation, ready, layers.arcs]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLayer = (key: keyof LayerToggles) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="relative w-full h-full" style={{ background: '#040608' }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Layer controls */}
      <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap z-10">
        {(Object.keys(layers) as Array<keyof LayerToggles>).map(key => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className="px-2 py-1 text-xs font-terminal transition-all"
            style={{
              background: layers[key] ? 'rgba(0,212,255,0.15)' : 'rgba(13,21,32,0.8)',
              border: `1px solid ${layers[key] ? '#00d4ff' : '#1a2535'}`,
              color: layers[key] ? '#00d4ff' : '#4a5568',
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Loading overlay */}
      {!ready && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: '#040608', zIndex: 20 }}
        >
          <div className="text-center">
            <div
              className="font-display text-sm mb-2"
              style={{ color: '#00d4ff', letterSpacing: '0.2em' }}
            >
              INITIALIZING GLOBE
            </div>
            <div className="font-terminal text-xs" style={{ color: '#4a5568' }}>
              Loading CesiumJS renderer...
            </div>
          </div>
        </div>
      )}

      {/* Selected hotspot popup */}
      {selectedHotspot && (
        <div
          className="absolute top-4 right-4 p-3 panel panel-corners z-10 max-w-xs"
          style={{ minWidth: '200px' }}
        >
          <button
            onClick={() => setSelectedHotspot(null)}
            className="absolute top-2 right-2 font-terminal text-xs"
            style={{ color: '#4a5568' }}
          >
            ×
          </button>
          <div
            className="font-ui font-semibold text-sm mb-1"
            style={{ color: getThreatColor(selectedHotspot.threatLevel) }}
          >
            {selectedHotspot.country}
          </div>
          <div className="font-display text-xs mb-2" style={{ color: '#8a9ab5' }}>
            THREAT: {selectedHotspot.threatLevel}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-terminal text-xs" style={{ color: '#e8edf5' }}>
              <span style={{ color: '#4a5568' }}>SIGNALS</span>
              <span>{selectedHotspot.signalCount}</span>
            </div>
            <div className="flex justify-between font-terminal text-xs" style={{ color: '#e8edf5' }}>
              <span style={{ color: '#4a5568' }}>SCORE</span>
              <span>{Math.round(selectedHotspot.score)}</span>
            </div>
            <div className="flex justify-between font-terminal text-xs" style={{ color: '#e8edf5' }}>
              <span style={{ color: '#4a5568' }}>SOURCES</span>
              <span>{selectedHotspot.sources.join(', ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
