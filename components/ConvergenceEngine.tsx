'use client'

import type { ConvergenceEvent } from '@/lib/threatClassifier'
import { formatDistanceToNow } from 'date-fns'

export default function ConvergenceEngine({ events }: { events: ConvergenceEvent[] }) {
  if (!events.length) return null
  return (
    <div className="space-y-1.5">
      {events.map(e => {
        let ts = ''
        try { ts = formatDistanceToNow(new Date(e.lastSeen), { addSuffix: true }) } catch { /* */ }
        return (
          <div
            key={e.location}
            className="px-2 py-1.5 rounded text-xs"
            style={{ background: 'rgba(224,123,57,0.1)', border: '1px solid rgba(224,123,57,0.25)' }}
          >
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-ui font-semibold" style={{ color: 'var(--accent-orange)' }}>{e.location}</span>
              <span className="font-terminal" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ts}</span>
            </div>
            <div className="font-terminal" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              {e.sourceCount} independent sources: {e.sources.join(' · ')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
