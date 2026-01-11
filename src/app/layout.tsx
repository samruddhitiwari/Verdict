import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "VERDICT | Your startup idea. Judged.",
  description: "Most startup ideas fail quietly. VERDICT kills the bad ones early. Get a final, irreversible judgment on your startup idea.",
  keywords: ["startup", "idea validation", "startup judge", "YC", "founder tools"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
