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
      <body className="font-luxury antialiased" suppressHydrationWarning={true}>
        <div className="min-h-screen gradient-bg relative overflow-hidden">
          {/* Luxury background pattern */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23667eea' stop-opacity='0.1'/%3E%3Cstop offset='100%25' stop-color='%23764ba2' stop-opacity='0.05'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='url(%23a)'%3E%3Ccircle cx='25' cy='25' r='1'/%3E%3Ccircle cx='75' cy='25' r='1'/%3E%3Ccircle cx='25' cy='75' r='1'/%3E%3Ccircle cx='75' cy='75' r='1'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          {/* Floating gradient orbs for depth */}
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 animate-float-gentle" style={{
            background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, rgba(118,75,162,0.1) 70%, transparent 100%)',
            filter: 'blur(60px)',
            transform: 'translate(-50%, -50%)'
          }}></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 animate-float" style={{
            background: 'radial-gradient(circle, rgba(240,147,251,0.3) 0%, rgba(245,87,108,0.1) 70%, transparent 100%)',
            filter: 'blur(80px)',
            transform: 'translate(50%, 50%)',
            animationDelay: '2s'
          }}></div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
