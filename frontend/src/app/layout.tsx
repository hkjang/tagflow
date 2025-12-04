'use client';

import { I18nProvider } from '../lib/i18n';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <title>TagFlow</title>
        <meta name="description" content="RFID Tag Management System" />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
