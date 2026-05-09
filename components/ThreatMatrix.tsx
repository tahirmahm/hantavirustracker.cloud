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
  const score = assessment?.threatScore ?? 0
  const idx = LEVELS.indexOf(current)

  if (compact) {
    // Horizontal segmented bar
    return (
      <div className="flex gap-1 mt-2">
        {LEVELS.map((level, i) => {
          const color = getThreatColor(level)
          const active = i === idx
          const past = i < idx
          return (
            <div
              key={level}
              className="flex-1 rounded-sm"
              style={{
                height: '4px',
                background: active || past ? color : 'var(--border)',
                opacity: past ? 0.4 : 1,
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {LEVELS.map((level, i) => {
        const color = getThreatColor(level)
        const active = level === current
        const past = i < idx
        return (
          <div key={level} className="flex items-center gap-2" style={{ opacity: past ? 0.45 : 1 }}>
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: active ? color : 'var(--border)' }}
            />
            <div className="flex-1" style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: active ? `${Math.max(15, score)}%` : past ? '100%' : '0%',
                  background: color,
                  borderRadius: '2px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <span className="font-terminal shrink-0" style={{ fontSize: '9px', color: active ? color : 'var(--text-muted)', minWidth: '56px', letterSpacing: '0.05em' }}>
              {level}
            </span>
          </div>
        )
      })}
    </div>
  )
}
