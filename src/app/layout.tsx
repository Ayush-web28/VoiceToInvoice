import type { Metadata } from 'next';
import Link from 'next/link';
import { Mic, FileText, LayoutDashboard, History, Sparkles } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoiceToInvoice | Multimodal AI Invoicing & Cash Flow Copilot',
  description: 'Transform voice recordings and photos into official PayPal Invoices using Gemini 2.5 and PayPal Invoicing API v2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2.5 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600">
                      VoiceToInvoice
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-1">
                      AI Cash Flow Copilot
                    </span>
                  </div>
                </Link>

                <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                  <Link
                    href="/"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/invoicing"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Invoice Studio
                  </Link>
                  <Link
                    href="/invoices"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 transition-colors"
                  >
                    <History className="w-4 h-4" />
                    Ledger & Invoices
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  PayPal Sandbox Mode
                </div>
                <Link
                  href="/invoicing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/25 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  New Invoice
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} VoiceToInvoice. Powered by{' '}
              <span className="font-semibold text-blue-600">PayPal Invoicing API v2</span> &{' '}
              <span className="font-semibold text-indigo-600">Gemini 2.5 Multimodal</span>.
            </div>
            <div className="flex gap-4">
              <span>MIT Licensed</span>
              <span>•</span>
              <a
                href="https://github.com/Ayush-web28/VoiceToInvoice"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition"
              >
                GitHub Repository
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
