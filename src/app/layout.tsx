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
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <div className="min-h-screen gradient-bg">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
