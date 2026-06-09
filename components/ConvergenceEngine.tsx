'use client'

import type { ConvergenceEvent } from '@/lib/threatClassifier'
import { formatDistanceToNow } from 'date-fns'

export default function ConvergenceEngine({ events }: { events: ConvergenceEvent[] }) {
  if (!events.length) return null
  return (
    <div className="space-y-2">
      {events.map(e => {
        let ts = ''
        try { ts = formatDistanceToNow(new Date(e.lastSeen), { addSuffix: true }) } catch { /* */ }
        return (
          <div
            key={e.location}
            style={{
              padding: '10px 12px', borderRadius: 'var(--r-lg)',
              background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.3)',
            }}
          >
            <div className="flex justify-between items-baseline mb-0.5">
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--on-dark)', fontFamily: 'var(--font-body)' }}>{e.location}</span>
              <span style={{ fontSize: '11px', color: 'var(--on-dark-soft)', fontFamily: 'var(--font-mono)' }}>{ts}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(253,186,116,0.85)', fontFamily: 'var(--font-body)' }}>
              {e.sourceCount} independent sources: {e.sources.join(' · ')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
