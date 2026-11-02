import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/components/profile-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PersonalizeSheet } from "@/components/personalize-sheet";
import { AiAssistant } from "@/components/ai-assistant";
import { Toaster } from "@/components/ui/sonner";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Braven Hub — Events, alumni & careers",
  description: "RSVP to professional development events, connect with Braven and SJSU alumni, find jobs matched to you, and prep with an AI career coach. No login needed.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ProfileProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <PersonalizeSheet />
          <AiAssistant />
          <Toaster position="bottom-left" />
        </ProfileProvider>
      </body>
    </html>
  );
}
