import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/lib/app-store'
import './globals.css'

export const metadata: Metadata = {
  title: 'MedHome',
  description: 'Family medicine inventory, reminders, and restock planning',
  generator: 'MedHome',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppProvider>{children}</AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
