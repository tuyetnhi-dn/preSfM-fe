import type { Metadata } from "next";
import {
  Space_Grotesk,
  Public_Sans,
  Noto_Sans,
  Playfair_Display,
} from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const playfairDisplayHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});
const body = Public_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "PreSfM Web",
  description: "Smart preprocessing dashboard for OpenSfM pipelines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans",
        notoSans.variable,
        playfairDisplayHeading.variable,
      )}
    >
      <body
        className={`${playfairDisplayHeading.variable} ${body.variable} font-sans text-ink`}
      >
        <Toaster />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
