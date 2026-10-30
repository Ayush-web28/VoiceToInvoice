import Link from 'next/link';
import {
  Mic,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
  FileCheck,
  Sparkles,
  Receipt,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
            Gemini 2.5 Multimodal + PayPal Invoicing API v2
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Transform Spoken Job Notes & Receipts into{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
              Official PayPal Invoices
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The multimodal AI cash flow copilot for freelancers, contractors, and SMBs. Speak your billable hours or upload receipt photos — get official PayPal invoices dispatched in under 60 seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/invoicing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all group"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Launch Invoice Studio
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/invoices"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all"
            >
              <BarChart3 className="w-5 h-5 text-slate-500" />
              Cash Flow Ledger
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white/80 backdrop-blur border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Multimodal AI</div>
                <div className="text-sm font-bold text-slate-900">Voice & OCR Vision</div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">PayPal Invoicing</div>
                <div className="text-sm font-bold text-slate-900">API v2 Draft & Dispatch</div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Cash Flow Copilot</div>
                <div className="text-sm font-bold text-slate-900">AG Grid & Webhooks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Interactive Workflow Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            How It Works
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            From Field Note to Paid Invoice in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative group hover:border-blue-400 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-lg mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Speak or Snap Photos</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Record a voice memo on the job site: &ldquo;Billed four and a half hours at eighty bucks an hour plus sixty for parts.&rdquo; Or upload a photo of your hardware receipt.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative group hover:border-blue-400 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold text-lg mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Gemini 2.5 Extracts & Computes</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Gemini 2.5 Multimodal extracts line items, rates, customer details, and taxes into a live editable invoice document with real-time recalculations.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative group hover:border-blue-400 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-extrabold text-lg mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">PayPal Invoicing API v2 Dispatch</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              One click dispatches an official PayPal invoice to the customer with instant payment links, tracked automatically via webhooks on your AG Grid Cash Flow Ledger.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
