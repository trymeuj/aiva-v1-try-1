import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Agent Creator',
  description: 'Create your custom AI agent for various applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`antialiased text-gray-800 min-h-screen flex flex-col ${inter.className}`}>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-black">
          Skip to main content
        </a>
        
        {/* Main content area */}
        <main id="main-content" className="flex-1 relative h-full">
          {children}
        </main>
      </body>
    </html>
  )
}