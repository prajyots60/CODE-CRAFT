import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code Craft",
  description: "Code Craft is a platform for running and sharing code snippets",
  keywords: "code, craft, snippets, run, share, code execution, code craft, code snippets , online code editor, code playground, code runner, code sharing, code execution, code execution platform, javascript, python, typescript, react, angular, vue, svelte, code runner, code execution, code execution platform, code playground, code sharing, code snippets, online code editor",
  themeColor: "#000000",
  openGraph: {
    type: "website",
    locale: "en_US",
  }

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col`}
      >
        <ConvexClientProvider>
           {children}
        </ConvexClientProvider>
        <Footer />
        <Toaster />
      </body>
    </html>
    </ClerkProvider>
  );
}
