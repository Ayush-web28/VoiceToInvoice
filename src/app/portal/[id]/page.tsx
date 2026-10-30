'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Printer,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  ExternalLink,
  DollarSign,
  Download,
} from 'lucide-react';
import { InvoiceData } from '@/types';

export default function ClientPayPortalPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        const res = await fetch(`/api/invoice/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invoice not found');
        setInvoice(data.invoice);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load invoice';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [id]);

  const handleSimulatePayment = async () => {
    if (!invoice) return;
    setIsMarkingPaid(true);
    try {
      const res = await fetch('/api/webhooks/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'INVOICING.INVOICE.PAID',
          resource: {
            id: invoice.paypalInvoiceId || invoice.id,
            invoice_number: invoice.invoiceNumber,
            status: 'PAID',
            payments: [
              {
                payment_id: `PAY-${Date.now()}`,
                payment_date: new Date().toISOString(),
                method: 'PAYPAL',
                amount: {
                  currency_code: invoice.currency,
                  value: invoice.totalAmount.toFixed(2),
                },
              },
            ],
          },
        }),
      });

      if (res.ok) {
        setInvoice((prev) =>
          prev
            ? {
                ...prev,
                status: 'PAID',
                paidAt: new Date().toISOString(),
              }
            : null
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold">Loading official invoice portal...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Invoice Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          We could not locate invoice reference <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{id}</code>.
        </p>
        <Link
          href="/invoicing"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Invoice Studio
        </Link>
      </div>
    );
  }

  const isPaid = invoice.status === 'PAID' || invoice.status === 'MARKED_AS_PAID';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner & Navigation (Hidden in Print) */}
      <div className="no-print mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cash Flow Ledger
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print to PDF
          </button>

          {!isPaid && (
            <button
              onClick={handleSimulatePayment}
              disabled={isMarkingPaid}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Simulate Sandbox Payment
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Invoice Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print-page">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-black tracking-tight">
                {invoice.merchant.businessName || 'Contractor Services'}
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Official PayPal Invoicing API v2 Electronic Invoice
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                isPaid
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              }`}
            >
              {isPaid ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5" />}
              {invoice.status}
            </span>
            <div className="mt-1 font-mono text-xs text-slate-300">
              {invoice.invoiceNumber}
            </div>
          </div>
        </div>

        {/* Invoice Body Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Merchant and Client Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-6 border-b border-slate-200">
            {/* Invoicer Details */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                From (Invoicer)
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {invoice.merchant.name || invoice.merchant.businessName}
              </h3>
              {invoice.merchant.email && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.merchant.email}
                </div>
              )}
              {invoice.merchant.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.merchant.phone}
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Billed To (Client)
              </span>
              <h3 className="text-sm font-bold text-slate-900">{invoice.customer.name}</h3>
              {invoice.customer.email && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.customer.email}
                </div>
              )}
              {invoice.customer.address?.addressLine1 && (
                <p className="text-xs text-slate-600 mt-0.5">
                  {invoice.customer.address.addressLine1}
                  {invoice.customer.address.adminArea2 && `, ${invoice.customer.address.adminArea2}`}
                  {invoice.customer.address.adminArea1 && ` ${invoice.customer.address.adminArea1}`}
                  {invoice.customer.address.postalCode && ` ${invoice.customer.address.postalCode}`}
                </p>
              )}
              {invoice.customer.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.customer.phone}
                </div>
              )}
            </div>
          </div>

          {/* Key Dates Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Issue Date</span>
              <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
              <span className="font-semibold text-blue-600">{invoice.paymentTerms.dueDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Terms</span>
              <span className="font-semibold text-slate-800">
                {invoice.paymentTerms.termType || 'Due Upon Receipt'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Currency</span>
              <span className="font-semibold text-slate-800">{invoice.currency} ($)</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-3 text-center w-24">Qty / Hrs</th>
                    <th className="py-3 px-3 text-right w-28">Rate</th>
                    <th className="py-3 px-3 text-center w-20">Tax %</th>
                    <th className="py-3 px-4 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {invoice.items.map((item, idx) => {
                    const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          {item.description && (
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          ${Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500">
                          {item.taxRate ? `${item.taxRate}%` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                          ${lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Financial Totals & Payment Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 items-start">
            {/* Notes & Terms */}
            <div className="space-y-4 text-xs">
              {invoice.paymentTerms.notes && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px] mb-1">
                    Customer Notes
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {invoice.paymentTerms.notes}
                  </p>
                </div>
              )}
              {invoice.paymentTerms.termsAndConditions && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px] mb-1">
                    Terms & Payment Conditions
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    {invoice.paymentTerms.termsAndConditions}
                  </p>
                </div>
              )}
            </div>

            {/* Financial Summary & Pay with PayPal Button */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ${invoice.subtotal.toFixed(2)}
                  </span>
                </div>

                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-rose-600">
                    <span>Discount:</span>
                    <span className="font-mono font-semibold">
                      -${invoice.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Sales Tax:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      +${invoice.taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-slate-900">Total Balance:</span>
                  <span className="text-2xl font-extrabold text-blue-700 font-mono">
                    ${invoice.totalAmount.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-500">{invoice.currency}</span>
                  </span>
                </div>
              </div>

              {/* PayPal Payment Button Section */}
              <div className="no-print">
                {isPaid ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      Invoice Paid in Full
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      Payment received via PayPal Sandbox Gateway.
                      {invoice.paidAt && ` Paid at: ${new Date(invoice.paidAt).toLocaleDateString()}`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <a
                      href={invoice.paypalPaymentUrl || `https://www.sandbox.paypal.com/invoice/p/#${invoice.paypalInvoiceId || invoice.invoiceNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-extrabold text-sm rounded-xl shadow-md transition group"
                    >
                      <span className="font-black italic text-base">Pay</span>
                      <span className="font-bold text-[#0070BA] italic text-base">Pal</span>
                      <span className="ml-1 text-xs font-bold text-[#003087] group-hover:underline">
                        Pay ${invoice.totalAmount.toFixed(2)} Now
                      </span>
                      <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                    </a>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Secured by PayPal Sandbox Invoicing Gateway
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
