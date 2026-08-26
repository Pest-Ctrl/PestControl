import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bug Tracking System",
  description: "Made by the PestControl Team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} h-full antialiased font-mono`}
    >
      <body className="min-h-full flex flex-col font-mono">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
