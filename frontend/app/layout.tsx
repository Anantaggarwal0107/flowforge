import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowForge — Visual AI Pipeline Builder",
  description: "Build, connect, and run AI pipelines visually. Chain LLM transforms, HTTP requests, filters, and webhooks without writing glue code.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-white antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
