import { NextRequest, NextResponse } from 'next/server';
import { invoiceStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const eventType = event.event_type;
    const resource = event.resource || {};
    const invoiceId = resource.id || resource.invoice_number;

    console.log(`[PayPal Webhook] Received event: ${eventType} for invoice: ${invoiceId}`);

    if (!invoiceId) {
      return NextResponse.json(
        { warning: 'No invoice resource ID identified in webhook payload' },
        { status: 200 }
      );
    }

    switch (eventType) {
      case 'INVOICING.INVOICE.PAID': {
        const paymentDate =
          resource.payments?.[0]?.payment_date || new Date().toISOString();
        invoiceStore.updateStatus(invoiceId, 'PAID', paymentDate);
        console.log(`[PayPal Webhook] Marked invoice ${invoiceId} as PAID at ${paymentDate}`);
        break;
      }

      case 'INVOICING.INVOICE.CANCELLED': {
        invoiceStore.updateStatus(invoiceId, 'CANCELLED');
        console.log(`[PayPal Webhook] Marked invoice ${invoiceId} as CANCELLED`);
        break;
      }

      case 'INVOICING.INVOICE.REFUNDED': {
        invoiceStore.updateStatus(invoiceId, 'REFUNDED');
        console.log(`[PayPal Webhook] Marked invoice ${invoiceId} as REFUNDED`);
        break;
      }

      case 'INVOICING.INVOICE.SCHEDULED': {
        invoiceStore.updateStatus(invoiceId, 'SCHEDULED');
        break;
      }

      default: {
        console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
        break;
      }
    }

    return NextResponse.json({
      received: true,
      event_type: eventType,
      invoice_id: invoiceId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('PayPal webhook error:', error);
    const msg = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
