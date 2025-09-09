import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { Suspense } from "react"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FitForge AI - Your Personal Fitness Coach",
  description: "Transform your fitness journey with AI-powered personalized workout plans, nutrition guidance, and progress tracking",
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['fitness', 'AI', 'workout', 'nutrition', 'health', 'personal trainer', 'exercise'],
  authors: [{ name: 'FitForge AI Team' }],
  creator: 'FitForge AI',
  publisher: 'FitForge AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fitforge.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'FitForge AI',
    title: 'FitForge AI - Your Personal Fitness Coach',
    description: 'Transform your fitness journey with AI-powered personalized workout plans, nutrition guidance, and progress tracking',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FitForge AI - Personal Fitness Coach',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitForge AI - Your Personal Fitness Coach',
    description: 'Transform your fitness journey with AI-powered personalized workout plans, nutrition guidance, and progress tracking',
    images: ['/images/twitter-image.png'],
    creator: '@fitforgeai',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FitForge AI',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'FitForge AI',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            {children}
            <ServiceWorkerRegistration />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
