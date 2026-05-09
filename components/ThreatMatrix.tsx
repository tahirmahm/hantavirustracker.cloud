'use client'

import type { ThreatAssessment } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'

const LEVELS = ['MINIMAL', 'LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL'] as const

interface ThreatMatrixProps {
  assessment: ThreatAssessment | null
  compact?: boolean
}

export default function ThreatMatrix({ assessment, compact }: ThreatMatrixProps) {
  const current = assessment?.globalThreatLevel ?? 'MINIMAL'
  const score   = assessment?.threatScore ?? 0
  const idx     = LEVELS.indexOf(current)

  if (compact) {
    return (
      <div className="flex gap-1 mt-3">
        {LEVELS.map((level, i) => (
          <div
            key={level}
            style={{
              flex: 1, height: '4px', borderRadius: '2px',
              background: i <= idx ? getThreatColor(level) : 'var(--hairline)',
              opacity: i < idx ? 0.45 : 1,
              transition: 'background 0.4s',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {LEVELS.map((level, i) => {
        const color  = getThreatColor(level)
        const active = level === current
        const past   = i < idx
        return (
          <div key={level} className="flex items-center gap-2.5" style={{ opacity: past ? 0.4 : 1 }}>
            <div
              style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background: active ? color : 'var(--hairline-strong)',
              }}
            />
            <div style={{ flex: 1, height: '3px', background: 'var(--hairline)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: color, borderRadius: '2px', transition: 'width 0.5s ease',
                width: active ? `${Math.max(10, score)}%` : past ? '100%' : '0%',
              }} />
            </div>
            <span style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: active ? color : 'var(--muted-soft)', minWidth: '60px', textAlign: 'right',
              fontFamily: 'var(--font-body)',
            }}>
              {level}
            </span>
          </div>
        )
      })}
    </div>
  )
}
