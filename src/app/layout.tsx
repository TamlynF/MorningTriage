import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Morning Triage',
  description: 'Daily planning app for ADHD',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
