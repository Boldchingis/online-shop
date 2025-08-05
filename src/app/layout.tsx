import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'STORE - Premium Quality Products',
    template: '%s | STORE'
  },
  description: 'Discover premium quality products with exceptional service. Your trusted destination for modern essentials.',
  keywords: ['ecommerce', 'online store', 'premium products', 'shopping'],
  authors: [{ name: 'STORE Team' }],
  creator: 'STORE',
  publisher: 'STORE',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'STORE - Premium Quality Products',
    description: 'Discover premium quality products with exceptional service.',
    siteName: 'STORE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STORE - Premium Quality Products',
    description: 'Discover premium quality products with exceptional service.',
    creator: '@store',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
