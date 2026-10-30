import Link from 'next/link';
import { Mic, ArrowRight, ShieldCheck, Zap, DollarSign, FileCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
            Gemini 2.5 Multimodal + PayPal Invoicing v2
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Turn Voice Notes & Receipts into{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Paid PayPal Invoices
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Record spoken job notes or snap photos of handwritten receipts. VoiceToInvoice extracts line items, calculates taxes, and dispatches official PayPal invoices in seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/invoicing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all group"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Launch Invoice Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/invoices"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all"
            >
              View Cash Flow Ledger
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
