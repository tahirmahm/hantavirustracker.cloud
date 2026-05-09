'use client'

import { useEffect, useRef } from 'react'

interface TerminalLogProps {
  lines: string[]
}

export default function TerminalLog({ lines }: TerminalLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef(true)

  useEffect(() => {
    if (autoScrollRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lines])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 40
  }

  return (
    <div
      className="panel panel-corners shrink-0 flex flex-col"
      style={{
        height: '160px',
        borderTop: '1px solid var(--bg-panel-border)',
      }}
      aria-live="polite"
      aria-label="Terminal event log"
    >
      {/* Header */}
      <div
        className="px-3 py-1 font-display text-xs tracking-widest shrink-0 flex items-center gap-2"
        style={{
          color: '#00ff41',
          borderBottom: '1px solid rgba(0,255,65,0.15)',
          background: 'rgba(0,255,65,0.03)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full dot-live"
          style={{ background: '#00ff41', boxShadow: '0 0 4px #00ff41' }}
        />
        SYSTEM LOG
        <span className="ml-auto font-terminal text-xs cursor">
        </span>
      </div>

      {/* Log lines */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-terminal text-xs p-2 space-y-0.5"
        style={{ background: '#020304' }}
        onScroll={handleScroll}
      >
        {lines.length === 0 ? (
          <div style={{ color: '#4a5568' }}>Initializing...</div>
        ) : (
          lines.map((line, i) => {
            const isError = line.includes('ERROR')
            const isConvergence = line.includes('CONVERGENCE')
            const isWarning = line.includes('WARNING') || line.includes('ELEVATED') || line.includes('HIGH')
            const isInit = line.includes('SYSTEM INIT')

            const color =
              isError ? '#ff2040' :
              isConvergence ? '#ff6b00' :
              isWarning ? '#f0c040' :
              isInit ? '#00d4ff' :
              '#00ff41'

            return (
              <div
                key={i}
                className="leading-relaxed whitespace-pre-wrap break-all"
                style={{ color, opacity: i === lines.length - 1 ? 1 : 0.75 }}
              >
                {line}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
