'use client'

import { useEffect, useRef } from 'react'

export default function TerminalLog({ lines, fillHeight }: { lines: string[]; fillHeight?: boolean }) {
  const bottomRef   = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoScroll  = useRef(true)

  useEffect(() => {
    if (autoScroll.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div
      className="flex flex-col"
      style={{
        ...(fillHeight ? { flex: 1, minHeight: 0 } : { height: '140px', flexShrink: 0 }),
        background: 'var(--surface-dark)',
        borderTop: '1px solid #2a2521',
      }}
      aria-live="polite"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 shrink-0"
        style={{ borderBottom: '1px solid #2a2521' }}
      >
        <span className="pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-dark-soft)', fontFamily: 'var(--font-body)' }}>
          System Log
        </span>
      </div>

      {/* Lines */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: '1.6' }}
        onScroll={() => {
          if (!containerRef.current) return
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current
          autoScroll.current = scrollHeight - scrollTop - clientHeight < 40
        }}
      >
        {!lines.length
          ? <span style={{ color: '#555' }}>Initializing…</span>
          : lines.map((line, i) => {
              const color =
                line.includes('ERROR')       ? '#f87171' :
                line.includes('CONVERGENCE') ? '#fb923c' :
                line.includes('WARNING')     ? '#fbbf24' :
                line.includes('SYSTEM INIT') ? '#60a5fa' :
                '#86efac'
              return (
                <div key={i} style={{ color, opacity: i === lines.length - 1 ? 1 : 0.6 }}>
                  {line}
                </div>
              )
            })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
