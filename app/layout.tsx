import React from "react"
import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import { Toaster } from 'sonner'

import './globals.css'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'BGM - Badminton Gang Management',
  description: 'แอปพลิเคชันจัดก๊วนแบดมินตัน',
  icons: {
    icon: '/zz-logo.png',
    apple: '/zz-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors duration={1500} offset={8} />
      </body>
    </html>
  )
}
