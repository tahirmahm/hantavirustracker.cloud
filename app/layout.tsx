import type { Metadata } from 'next'
import { Share_Tech_Mono, Rajdhani, Orbitron } from 'next/font/google'
import './globals.css'

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-terminal',
  display: 'swap',
})

const rajdhani = Rajdhani({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

const orbitron = Orbitron({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HantavirusTracker.cloud — Global Surveillance Dashboard',
  description: 'Real-time hantavirus surveillance. Live monitoring of WHO, CDC, ProMED, ECDC and global news sources.',
  keywords: 'hantavirus, surveillance, OSINT, outbreak, WHO, CDC, ProMED, epidemiology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${shareTechMono.variable} ${rajdhani.variable} ${orbitron.variable} h-full`}
    >
      <body className="h-full overflow-hidden" style={{ background: 'var(--bg-void)' }}>
        {children}
      </body>
    </html>
  )
}
