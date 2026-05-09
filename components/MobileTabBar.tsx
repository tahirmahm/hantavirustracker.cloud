'use client'

export type MobileTab = 'map' | 'metrics' | 'feed' | 'log'

const TABS: { id: MobileTab; label: string; svg: React.ReactNode }[] = [
  {
    id: 'map',
    label: 'Map',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="4" ry="8" stroke="currentColor" strokeWidth="1.2" />
        <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.2" />
        <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: 'metrics',
    label: 'Metrics',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3"  y="11" width="3" height="6" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="8"  y="7"  width="3" height="10" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="13" y="4"  width="3" height="13" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'feed',
    label: 'Feed',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <line x1="4" y1="5"  x2="16" y2="5"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="9"  x2="16" y2="9"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="13" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="17" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'log',
    label: 'Log',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 8l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="11" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function MobileTabBar({
  active,
  onChange,
}: {
  active: MobileTab
  onChange: (t: MobileTab) => void
}) {
  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--surface-card)',
        borderTop: '1px solid var(--hairline)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 200,
      }}
    >
      {TABS.map(({ id, label, svg }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--ink)' : 'var(--muted-soft)',
              transition: 'color 0.12s',
              WebkitTapHighlightColor: 'transparent',
              padding: '8px 0',
            }}
          >
            {svg}
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-body)',
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
