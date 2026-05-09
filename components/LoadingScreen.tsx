'use client'

import { useEffect, useState } from 'react'

const TITLE    = 'HantavirusTracker'
const SUBTITLE = 'Global Epidemiological Surveillance'

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [chars, setChars]   = useState(0)
  const [showSub, setShowSub] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone]     = useState(false)

  useEffect(() => {
    let t = 0
    const ti = setInterval(() => {
      t++; setChars(t)
      if (t >= TITLE.length) {
        clearInterval(ti)
        setTimeout(() => setShowSub(true), 200)
        let p = 0
        const pi = setInterval(() => {
          p += Math.random() * 9 + 3
          setProgress(Math.min(100, p))
          if (p >= 100) {
            clearInterval(pi)
            setTimeout(() => { setDone(true); onDone() }, 300)
          }
        }, 90)
      }
    }, 60)
    return () => clearInterval(ti)
  }, [onDone])

  if (done) return null

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: 'var(--canvas)' }}
    >
      {/* Pastel orbs */}
      <div className="orb" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, var(--orb-sky) 0%, transparent 70%)', top: '-100px', left: '-80px', opacity: 0.5 }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, var(--orb-lavender) 0%, transparent 70%)', bottom: '-60px', right: '-40px', opacity: 0.5 }} />

      <div style={{ textAlign: 'center', maxWidth: '420px', padding: '0 32px', position: 'relative', zIndex: 1 }}>
        {/* Wordmark */}
        <h1
          className="font-display"
          style={{ fontSize: '40px', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '8px', minHeight: '52px', lineHeight: 1.1 }}
        >
          {TITLE.slice(0, chars)}
          {chars < TITLE.length && <span style={{ opacity: 0.3 }}>|</span>}
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted)',
            letterSpacing: '0.04em', minHeight: '20px', marginBottom: '32px',
            opacity: showSub ? 1 : 0, transition: 'opacity 0.4s',
          }}
        >
          {SUBTITLE}
        </p>

        {/* Progress */}
        {showSub && (
          <div>
            <div style={{ height: '1px', background: 'var(--hairline)', borderRadius: '1px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'var(--ink)', borderRadius: '1px',
                transition: 'width 0.1s ease',
              }} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted-soft)', fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}>
              {progress < 30 ? 'Loading feed parsers…' : progress < 60 ? 'Initializing map…' : progress < 85 ? 'Connecting sources…' : 'Ready'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
