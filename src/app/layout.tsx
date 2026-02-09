import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import ConvexClientProvider from "@/components/providers/ConvexProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Citizen Copilot — Discover Your Government Benefits",
  description:
    "AI-powered platform that automatically discovers eligible government welfare schemes for Indian citizens. Upload your ID, verify your identity, and get personalized benefit recommendations.",
  keywords: [
    "government schemes",
    "welfare benefits",
    "aadhaar",
    "citizen",
    "India",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-card)",
              color: "var(--color-card-foreground)",
              border: "1px solid var(--color-border)",
            },
          }}
        />
      </body>
    </html>
  );
}
