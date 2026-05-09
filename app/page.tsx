'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues (CesiumJS requires window)
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false })

export default function Home() {
  return <Dashboard />
}
