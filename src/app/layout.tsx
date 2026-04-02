import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyncSpace - Student Productivity & Collaboration",
  description: "Stay on top of module deadlines and group projects with SyncSpace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full overflow-hidden text-slate-900 selection:bg-blue-100`}>
        <div className="flex h-full w-full">
          <div className="hidden lg:flex lg:flex-col lg:w-64">
            <Sidebar />
          </div>
          <div className="flex flex-col flex-1 min-w-0 bg-slate-50/50">
            <Header />
            <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 xl:px-12 w-full max-w-7xl mx-auto scroll-smooth">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
