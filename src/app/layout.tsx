import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const display = localFont({
  src: './fonts/fraunces-variable.woff2',
  variable: '--font-display',
  display: 'swap',
  weight: '100 900',
})

const sans = localFont({
  src: [
    { path: './fonts/ibm-plex-sans-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-sans-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/ibm-plex-sans-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const mono = localFont({
  src: [
    { path: './fonts/ibm-plex-mono-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-mono-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hypotrophy — Human Capital Engine',
  description:
    'Local-first personal growth ledger: hash-chained events, Merkle receipts, Thompson sampling and half-Kelly allocation. Built from a hackUMBC project.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
