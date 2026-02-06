import type { Metadata } from 'next'
import ApolloWrapper from '../lib/ApolloWrapper'
import { Figtree } from 'next/font/google'

import './globals.css'

const figTree = Figtree({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eversports frontend assignment',
  description: 'Looking forward to see what you come up with!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={figTree.className}>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  )
}
