import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/lib/app-store'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'MedHome',
  description: 'Family medicine inventory, reminders, and restock planning',
  openGraph: {
    title: 'MedHome',
    description: 'Family medicine inventory, reminders, and restock planning',
    type: 'website',
    images: ['/icon.svg'],
  },
  generator: 'MedHome',
  icons: {
    icon: '/icon.svg',
    apple: '/placeholder-logo.png',
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
