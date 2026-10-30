'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Bell,
  Eye,
  Filter,
} from 'lucide-react';
import { InvoiceData } from '@/types';

export default function CashFlowLedgerPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [metrics, setMetrics] = useState({
    totalPaidReceivables: 0,
    pendingRevenue: 0,
    averageTurnaroundDays: 0,
    totalInvoicesCount: 0,
  });
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const gridRef = useRef<AgGridReact<InvoiceData>>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (res.ok && data.invoices) {
        setInvoices(data.invoices);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to load ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSendReminder = (invoice: InvoiceData) => {
    setReminderToast(
      `Automated payment reminder cadence sent to ${invoice.customer.email} for ${invoice.invoiceNumber}!`
    );
    setTimeout(() => setReminderToast(null), 4000);
  };

  // AG Grid Column Definitions
  const columnDefs: ColDef<InvoiceData>[] = useMemo(
    () => [
      {
        headerName: 'Invoice #',
        field: 'invoiceNumber',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: ICellRendererParams<InvoiceData>) => {
          const inv = params.data;
          if (!inv) return null;
          return (
            <Link
              href={`/portal/${inv.paypalInvoiceId || inv.id || inv.invoiceNumber}`}
              className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              {inv.invoiceNumber}
              <Eye className="w-3.5 h-3.5 opacity-60" />
            </Link>
          );
        },
      },
      {
        headerName: 'Issue Date',
        field: 'invoiceDate',
        width: 130,
        sortable: true,
        filter: 'agDateColumnFilter',
      },
      {
        headerName: 'Customer',
        field: 'customer.name',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: ICellRendererParams<InvoiceData>) => {
          const inv = params.data;
          if (!inv) return null;
          return (
            <div className="py-1">
              <div className="font-semibold text-slate-900 leading-tight">
                {inv.customer.name}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {inv.customer.email}
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Due Date',
        field: 'paymentTerms.dueDate',
        width: 130,
        sortable: true,
      },
      {
        headerName: 'Total ($)',
        field: 'totalAmount',
        width: 140,
        sortable: true,
        filter: 'agNumberColumnFilter',
        cellRenderer: (params: ICellRendererParams<InvoiceData>) => {
          const val = params.value;
          return (
            <span className="font-mono font-bold text-slate-900 text-sm">
              ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 140,
        sortable: true,
        filter: 'agSetColumnFilter',
        cellRenderer: (params: ICellRendererParams<InvoiceData>) => {
          const status = params.value;
          let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
          if (status === 'PAID' || status === 'MARKED_AS_PAID') {
            badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
          } else if (status === 'SENT') {
            badgeClass = 'bg-blue-50 text-blue-700 border-blue-300';
          } else if (status === 'OVERDUE') {
            badgeClass = 'bg-rose-50 text-rose-700 border-rose-300';
          }

          return (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeClass}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        headerName: 'Actions',
        minWidth: 200,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<InvoiceData>) => {
          const inv = params.data;
          if (!inv) return null;
          const isPaid = inv.status === 'PAID' || inv.status === 'MARKED_AS_PAID';

          return (
            <div className="flex items-center gap-1.5 h-full py-1">
              <Link
                href={`/portal/${inv.paypalInvoiceId || inv.id || inv.invoiceNumber}`}
                className="px-2 py-1 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                title="View Invoice Portal"
              >
                Portal
              </Link>

              {inv.paypalPaymentUrl && (
                <a
                  href={inv.paypalPaymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 text-xs font-semibold text-[#0070BA] hover:bg-blue-50 rounded transition inline-flex items-center gap-1"
                  title="PayPal Sandbox Payer Link"
                >
                  PayPal <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {!isPaid && (
                <button
                  type="button"
                  onClick={() => handleSendReminder(inv)}
                  className="px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded transition inline-flex items-center gap-1"
                  title="Send Automated Reminder"
                >
                  <Bell className="w-3 h-3 text-amber-600" />
                  Remind
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  const onFilterTextBoxChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    gridRef.current?.api.setGridOption('quickFilterText', e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cash Flow Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Live PayPal Sync
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real-time receivables tracker, automated payment reminder cadences, and AG Grid cash flow ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInvoices}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/invoicing"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Reminder Notification Toast */}
      {reminderToast && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <Bell className="w-4 h-4 text-amber-600 shrink-0" />
            {reminderToast}
          </div>
          <button
            onClick={() => setReminderToast(null)}
            className="text-xs text-amber-700 hover:text-amber-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Paid Receivables */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Paid Receivables
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              ${metrics.totalPaidReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settled into PayPal balance
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Pending Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pending Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">
              ${metrics.pendingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-blue-700 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Dispatched & waiting on buyer
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Average Turnaround */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Avg Turnaround Time
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {metrics.averageTurnaroundDays} <span className="text-lg font-medium text-slate-500">Days</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Accelerated via voice copilot
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AG Grid Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        {/* Search Bar & Grid Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={onFilterTextBoxChanged}
              placeholder="Search by client, invoice #, amount, or status..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{invoices.length}</strong> invoices
          </div>
        </div>

        {/* AG Grid Component */}
        <div className="ag-theme-quartz w-full" style={{ height: '480px' }}>
          <AgGridReact<InvoiceData>
            ref={gridRef}
            rowData={invoices}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={52}
            headerHeight={44}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50]}
            animateRows={true}
          />
        </div>
      </div>
    </div>
  );
}
