'use client'

import { useEffect, useRef } from 'react'

export default function TerminalLog({ lines }: { lines: string[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef(true)

  useEffect(() => {
    if (autoScrollRef.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div
      className="panel shrink-0 flex flex-col"
      style={{ height: '150px', borderTop: '1px solid var(--border)' }}
      aria-live="polite"
    >
      {/* Header */}
      <div
        className="px-3 py-1.5 flex items-center gap-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-highlight)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full dot-live" style={{ background: 'var(--text-terminal)' }} />
        <span className="section-label">System Log</span>
        <span className="cursor ml-auto" />
      </div>

      {/* Log lines */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 font-terminal"
        style={{ background: 'var(--bg-void)', fontSize: '11px' }}
        onScroll={() => {
          if (!containerRef.current) return
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current
          autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 40
        }}
      >
        {!lines.length
          ? <span style={{ color: 'var(--text-muted)' }}>Initializing…</span>
          : lines.map((line, i) => {
              const color =
                line.includes('ERROR')       ? 'var(--threat-high)' :
                line.includes('CONVERGENCE') ? 'var(--accent-orange)' :
                line.includes('WARNING')     ? 'var(--threat-moderate)' :
                line.includes('SYSTEM INIT') ? 'var(--accent-blue)' :
                'var(--text-terminal)'
              return (
                <div key={i} style={{ color, opacity: i === lines.length - 1 ? 1 : 0.65, lineHeight: '1.5' }}>
                  {line}
                </div>
              )
            })
        }
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
