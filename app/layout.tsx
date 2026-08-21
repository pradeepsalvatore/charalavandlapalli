import type { Metadata } from 'next'
import './globals.css'
import SiteHeader from './components/site-header'

export const metadata: Metadata = {
  title: 'Charalavandlapalli Village Community',
  description:
    'The official community portal for Charalavandlapalli',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}