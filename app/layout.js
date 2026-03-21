import { Inter, DM_Serif_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tippytix.app'),
  title: {
    default: 'TippyTix - Event Ticketing Made Simple',
    template: '%s | TippyTix',
  },
  description: 'TippyTix is the easiest way to sell tickets for concerts, performances, and events. Create event pages, sell tickets online, and scan QR codes at the door.',
  keywords: ['ticketing', 'event tickets', 'concerts', 'performances', 'QR code', 'event management', 'sell tickets online'],
  authors: [{ name: 'TippyTix' }],
  creator: 'TippyTix',
  openGraph: {
    title: 'TippyTix - Event Ticketing Made Simple',
    description: 'The easiest way to sell tickets for concerts, performances, and events. Create event pages, sell tickets online, and scan QR codes at the door.',
    url: 'https://tippytix.app',
    siteName: 'TippyTix',
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TippyTix - Event Ticketing Made Simple',
    description: 'The easiest way to sell tickets for concerts, performances, and events.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} ${dancingScript.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
        <Toaster duration={8000} />
      </body>
    </html>
  );
}
