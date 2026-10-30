import { NextRequest, NextResponse } from 'next/server';
import { generateInvoiceNumber, createDraftInvoice, sendInvoice } from '@/lib/paypal/invoices';
import { invoiceStore, clientStore } from '@/lib/store';
import { InvoiceData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InvoiceData;

    // Validate customer details
    if (!body.customer?.name || !body.customer?.email) {
      return NextResponse.json(
        { error: 'Customer name and valid email address are required.' },
        { status: 400 }
      );
    }

    // Validate line items
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Invoice must contain at least one line item.' },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      if (!item.name || Number(item.quantity) <= 0 || Number(item.unitPrice) < 0) {
        return NextResponse.json(
          { error: `Invalid line item: "${item.name || 'Unnamed'}" must have quantity > 0 and unit price >= 0.` },
          { status: 400 }
        );
      }
    }

    // Ensure invoice number
    let invoiceNumber = body.invoiceNumber?.trim();
    if (!invoiceNumber || invoiceNumber === 'INV2-VTI-1001') {
      invoiceNumber = await generateInvoiceNumber();
    }

    const subtotal = body.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );

    let discountAmount = 0;
    if (body.discount?.amount && body.discount.amount > 0) {
      discountAmount = Number(body.discount.amount);
    } else if (body.discount?.percent && body.discount.percent > 0) {
      discountAmount = (subtotal * Number(body.discount.percent)) / 100;
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    const taxAmount = body.items.reduce((sum, item) => {
      const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      const rate = Number(item.taxRate) || 0;
      return sum + (lineTotal * rate) / 100;
    }, 0);

    const totalAmount = Number((discountedSubtotal + taxAmount).toFixed(2));

    const preparedInvoice: InvoiceData = {
      ...body,
      id: body.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      invoiceNumber,
      status: 'DRAFT',
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalAmount,
      invoiceDate: body.invoiceDate || new Date().toISOString().split('T')[0],
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Step 1: Create draft invoice in PayPal Invoicing API v2
    console.log(`[PayPal] Creating draft invoice for ${invoiceNumber}...`);
    const draftResponse = await createDraftInvoice(preparedInvoice);
    const paypalInvoiceId = draftResponse.id;

    // Step 2: Dispatch invoice via PayPal
    console.log(`[PayPal] Dispatching invoice ${paypalInvoiceId}...`);
    const sendResult = await sendInvoice(paypalInvoiceId);

    // Step 3: Save to local store with status SENT
    const finalizedInvoice: InvoiceData = {
      ...preparedInvoice,
      paypalInvoiceId,
      status: 'SENT',
      paypalPaymentUrl: sendResult.paymentUrl,
      updatedAt: new Date().toISOString(),
    };

    invoiceStore.save(finalizedInvoice);

    // Step 4: Update or insert client directory record
    clientStore.save({
      id: `client_${body.customer.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: body.customer.name,
      email: body.customer.email,
      phone: body.customer.phone,
      companyName: body.customer.companyName,
      totalInvoiced: totalAmount,
      totalPaid: 0,
      lastInvoiceDate: finalizedInvoice.invoiceDate,
      defaultPaymentTerms: body.paymentTerms.termType,
    });

    return NextResponse.json({
      success: true,
      paypalInvoiceId,
      invoiceNumber,
      paymentUrl: sendResult.paymentUrl,
      invoice: finalizedInvoice,
    });
  } catch (error: unknown) {
    console.error('Error in /api/invoice/send:', error);
    const msg = error instanceof Error ? error.message : 'Failed to dispatch PayPal invoice';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
