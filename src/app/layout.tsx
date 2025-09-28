import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hypotrophy - AI-Powered Personal Growth',
  description: 'Transform your basic to-do lists into intelligent self-improvement tracking with AI insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}