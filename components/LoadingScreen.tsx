'use client'

import { useEffect, useState } from 'react'

const TITLE = 'HANTAVIRUS TRACKER'
const SUBTITLE = 'Global Epidemiological Surveillance Dashboard'

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [titleChars, setTitleChars] = useState(0)
  const [showSub, setShowSub] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let t = 0
    const ti = setInterval(() => {
      t++; setTitleChars(t)
      if (t >= TITLE.length) {
        clearInterval(ti)
        setShowSub(true)
        let p = 0
        const pi = setInterval(() => {
          p += Math.random() * 10 + 4
          setProgress(Math.min(100, p))
          if (p >= 100) {
            clearInterval(pi)
            setTimeout(() => { setDone(true); onDone() }, 250)
          }
        }, 80)
      }
    }, 55)
    return () => clearInterval(ti)
  }, [onDone])

  if (done) return null

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50" style={{ background: 'var(--bg-void)' }}>
      <div className="text-center" style={{ maxWidth: '380px', width: '100%', padding: '0 24px' }}>
        {/* Icon */}
        <div className="mx-auto mb-8" style={{
          width: '48px', height: '48px', border: '1px solid var(--border)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid var(--accent-blue)', opacity: 0.6 }} />
        </div>

        {/* Title */}
        <h1 className="font-display font-bold mb-2" style={{
          fontSize: '22px', letterSpacing: '0.18em',
          color: 'var(--accent-blue)', minHeight: '28px',
        }}>
          {TITLE.slice(0, titleChars)}
          {titleChars < TITLE.length && <span style={{ opacity: 0.6 }}>|</span>}
        </h1>

        {/* Subtitle */}
        <p className="font-ui mb-8" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.04em', minHeight: '18px' }}>
          {showSub ? SUBTITLE : ''}
        </p>

        {/* Progress */}
        {showSub && (
          <div>
            <div style={{ height: '2px', background: 'var(--border)', borderRadius: '1px' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'var(--accent-blue)',
                borderRadius: '1px', transition: 'width 0.1s ease',
              }} />
            </div>
            <div className="font-terminal mt-2 text-center" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {progress < 30 ? 'Loading feed parsers…' :
               progress < 60 ? 'Initializing map…' :
               progress < 85 ? 'Connecting sources…' : 'Ready'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
