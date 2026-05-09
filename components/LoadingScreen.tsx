'use client'

import { useEffect, useState } from 'react'

const TITLE = 'HANTAVIRUS TRACKER'
const SUBTITLE = 'GLOBAL OSINT SURVEILLANCE DASHBOARD'

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [titleChars, setTitleChars] = useState(0)
  const [subtitleChars, setSubtitleChars] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Type title
    let t = 0
    const titleInterval = setInterval(() => {
      t++
      setTitleChars(t)
      if (t >= TITLE.length) {
        clearInterval(titleInterval)
        // Then type subtitle
        let s = 0
        const subInterval = setInterval(() => {
          s++
          setSubtitleChars(s)
          if (s >= SUBTITLE.length) {
            clearInterval(subInterval)
            setShowProgress(true)
            // Progress bar
            let p = 0
            const progressInterval = setInterval(() => {
              p += Math.random() * 12 + 4
              setProgress(Math.min(100, p))
              if (p >= 100) {
                clearInterval(progressInterval)
                setTimeout(() => {
                  setDone(true)
                  onDone()
                }, 300)
              }
            }, 80)
          }
        }, 30)
      }
    }, 60)

    return () => clearInterval(titleInterval)
  }, [onDone])

  if (done) return null

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: '#040608' }}
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative text-center z-10">
        {/* Biohazard-style decorative circle */}
        <div
          className="mx-auto mb-8 w-20 h-20 rounded-full border-2 flex items-center justify-center"
          style={{
            borderColor: 'rgba(0,212,255,0.4)',
            boxShadow: '0 0 40px rgba(0,212,255,0.2)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full border"
            style={{
              borderColor: 'rgba(0,212,255,0.6)',
              boxShadow: '0 0 20px rgba(0,212,255,0.3)',
            }}
          />
        </div>

        {/* Title */}
        <h1
          className="font-display text-4xl font-black tracking-widest mb-3"
          style={{
            color: '#00d4ff',
            textShadow: '0 0 30px rgba(0,212,255,0.5)',
            letterSpacing: '0.2em',
            minHeight: '2.5rem',
          }}
        >
          {TITLE.slice(0, titleChars)}
          {titleChars < TITLE.length && (
            <span style={{ opacity: Math.floor(Date.now() / 300) % 2 === 0 ? 1 : 0 }}>█</span>
          )}
        </h1>

        {/* Subtitle */}
        <div
          className="font-terminal text-sm tracking-widest mb-8"
          style={{ color: '#4a5568', minHeight: '1.5rem', letterSpacing: '0.15em' }}
        >
          {SUBTITLE.slice(0, subtitleChars)}
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-64 mx-auto">
            <div
              className="h-px mb-2"
              style={{ background: 'var(--bg-panel-border)' }}
            >
              <div
                className="h-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(to right, #00d4ff, #00ff88)',
                  boxShadow: '0 0 8px rgba(0,212,255,0.6)',
                }}
              />
            </div>
            <div className="font-terminal text-xs text-center" style={{ color: '#4a5568' }}>
              {progress < 30 ? 'LOADING FEED PARSERS...' :
               progress < 60 ? 'INITIALIZING GLOBE...' :
               progress < 85 ? 'CONNECTING SOURCES...' :
               'READY'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
