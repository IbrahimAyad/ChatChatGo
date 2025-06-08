import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatChatGo - Scalable AI Chat SaaS for Industry Domination',
  description: 'Transform your customer interactions with voice-first, AI-powered assistants. From restaurants to retail, healthcare to finance – we\'re building the Stripe for conversational AI.',
  keywords: [
    'AI chatbot',
    'conversational AI',
    'voice assistant',
    'multi-tenant SaaS',
    'restaurant chatbot',
    'customer service AI',
    'N8N integration',
    'lead generation',
    'white-label chatbot'
  ],
  authors: [{ name: 'ChatChatGo Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'ChatChatGo - Scalable AI Chat SaaS',
    description: 'Voice-first AI assistants for every industry. Build, deploy, and scale conversational experiences that convert.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatChatGo - Scalable AI Chat SaaS',
    description: 'Voice-first AI assistants for every industry.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  )
} 