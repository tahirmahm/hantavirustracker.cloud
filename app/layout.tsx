import type { Metadata } from 'next'
import { EB_Garamond, Inter, Share_Tech_Mono } from 'next/font/google'
import './globals.css'

// Waldenburg substitute — editorial display serif at weight 300
const ebGaramond = EB_Garamond({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

// Body / nav / captions — exactly what ElevenLabs uses
const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

// Terminal log / data values
const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HantavirusTracker.cloud — Global Surveillance Dashboard',
  description: 'Real-time hantavirus epidemiological surveillance. WHO, CDC, ProMED, ECDC and global news monitoring.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${inter.variable} ${shareTechMono.variable} h-full`}>
      <body className="h-full overflow-hidden" style={{ background: 'var(--canvas)', fontFamily: 'var(--font-body)' }}>
        {children}
      </body>
    </html>
  )
}
