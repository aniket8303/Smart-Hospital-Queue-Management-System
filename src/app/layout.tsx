import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueueProvider } from "@/context/QueueContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ToastContainer } from "@/components/common/ToastContainer";
import { SMSAlertBanner } from "@/components/common/SMSAlertBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediQueue — Smart Queues. Shorter Waits. Better Care.",
  description: "Intelligent real-time hospital queue management platform connecting patients, doctors, and hospital operations staff. Built by Team CodeForge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-cyan-500/20 selection:text-cyan-900 dark:selection:text-cyan-200">
        <QueueProvider>
          <Navbar />
          <SMSAlertBanner />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <ToastContainer />
        </QueueProvider>
      </body>
    </html>
  );
}
