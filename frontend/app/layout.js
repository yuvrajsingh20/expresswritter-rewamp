import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: "Express Writer | Production-Ready SaaS",
  description: "Multi-role workflow automation platform",
  manifest: "/manifest.json",
};

import SessionWrapper from "@/components/SessionWrapper";
import CookieBanner from "@/components/CookieBanner";
import FloatingChat from "@/components/chat/FloatingChat";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
       <body 
        className={`${inter.className} bg-background text-foreground antialiased`}
        suppressHydrationWarning={true}
      >
        <SessionWrapper>
          {children}
          <CookieBanner />
          {/* <FloatingChat /> */}
        </SessionWrapper>
      </body>
    </html>
  );
}
