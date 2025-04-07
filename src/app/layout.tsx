import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AppWithWorkflow from '@/components/SideDisplay/AppWithWorkflow'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AIVA',
  description: 'Your personal AI assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWithWorkflow>
          {children}
        </AppWithWorkflow>
      </body>
    </html>
  )
}