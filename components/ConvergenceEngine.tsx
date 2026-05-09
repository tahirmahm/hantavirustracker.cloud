'use client'

import type { ConvergenceEvent } from '@/lib/threatClassifier'
import { formatDistanceToNow } from 'date-fns'

interface ConvergenceEngineProps {
  events: ConvergenceEvent[]
}

export default function ConvergenceEngine({ events }: ConvergenceEngineProps) {
  if (events.length === 0) return null

  return (
    <div
      className="mx-2 mb-2 p-2 rounded"
      style={{
        background: 'rgba(255,107,0,0.06)',
        border: '1px solid rgba(255,107,0,0.3)',
      }}
    >
      <div
        className="font-display text-xs mb-2 tracking-wider"
        style={{ color: '#ff6b00' }}
      >
        ⚠ SIGNAL CONVERGENCE DETECTED
      </div>
      {events.map(e => {
        let timeStr = ''
        try { timeStr = formatDistanceToNow(new Date(e.lastSeen), { addSuffix: true }) } catch { /* ignore */ }

        return (
          <div key={e.location} className="mb-2 last:mb-0">
            <div className="flex justify-between items-baseline">
              <span className="font-terminal text-xs" style={{ color: '#e8edf5' }}>
                {e.location}
              </span>
              <span className="font-terminal" style={{ fontSize: '10px', color: '#4a5568' }}>
                {timeStr}
              </span>
            </div>
            <div className="font-terminal mt-0.5" style={{ fontSize: '10px', color: '#ff6b00' }}>
              {e.sourceCount} independent sources: {e.sources.join(' · ')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
