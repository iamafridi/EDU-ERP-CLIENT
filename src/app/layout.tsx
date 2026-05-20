import type { Metadata } from "next";
import { Playfair_Display, Manrope, DM_Sans } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import "./print.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hostel Pro-ERP — Campus Operating System",
  description:
    "Institutional campus operating system for universities and residential colleges. Academics, student life, dormitory blocks, fleet logistics & double-entry finance — unified in one premium platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${manrope.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-text font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
