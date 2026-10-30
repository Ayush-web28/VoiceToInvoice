import { NextRequest, NextResponse } from 'next/server';
import { invoiceStore } from '@/lib/store';
import { getInvoice, cancelInvoice } from '@/lib/paypal/invoices';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const invoice = invoiceStore.getById(id);

    if (invoice) {
      return NextResponse.json({ success: true, invoice });
    }

    // Fallback: Attempt fetching from PayPal directly
    try {
      const paypalInvoice = await getInvoice(id);
      return NextResponse.json({ success: true, paypalInvoice });
    } catch {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching invoice';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const invoice = invoiceStore.getById(id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.paypalInvoiceId) {
      try {
        await cancelInvoice(invoice.paypalInvoiceId, 'Cancelled by user via VoiceToInvoice');
      } catch (err) {
        console.warn('PayPal cancellation warning:', err);
      }
    }

    invoiceStore.updateStatus(id, 'CANCELLED');

    return NextResponse.json({ success: true, message: 'Invoice cancelled successfully' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error cancelling invoice';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
