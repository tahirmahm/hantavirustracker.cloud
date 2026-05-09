'use client'

import type { ThreatAssessment } from '@/lib/threatClassifier'
import { getThreatColor } from '@/lib/threatClassifier'

interface ThreatMatrixProps {
  assessment: ThreatAssessment | null
}

const THREAT_LEVELS = ['MINIMAL', 'LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL'] as const

export default function ThreatMatrix({ assessment }: ThreatMatrixProps) {
  const current = assessment?.globalThreatLevel ?? 'MINIMAL'
  const score = assessment?.threatScore ?? 0
  const currentIdx = THREAT_LEVELS.indexOf(current)

  return (
    <div className="p-3" style={{ borderBottom: '1px solid var(--bg-panel-border)' }}>
      <div className="font-ui text-xs mb-2" style={{ color: '#4a5568', letterSpacing: '0.1em' }}>
        THREAT MATRIX
      </div>
      <div className="space-y-1">
        {THREAT_LEVELS.map((level, idx) => {
          const color = getThreatColor(level)
          const isActive = level === current
          const isPast = idx < currentIdx

          return (
            <div
              key={level}
              className="flex items-center gap-2"
              style={{ opacity: isPast ? 0.4 : 1 }}
            >
              <div
                className="w-2 h-2 rounded-sm shrink-0"
                style={{
                  background: isActive ? color : 'transparent',
                  border: `1px solid ${color}`,
                  boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                }}
              />
              <div className="flex-1">
                <div
                  className="h-1 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${color}${isActive ? 'cc' : '33'}, transparent)`,
                    width: isActive ? `${Math.max(20, score)}%` : isPast ? '100%' : '0%',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div
                className="font-display text-xs shrink-0"
                style={{
                  color: isActive ? color : '#4a5568',
                  fontSize: '9px',
                  letterSpacing: '0.05em',
                }}
              >
                {level}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
