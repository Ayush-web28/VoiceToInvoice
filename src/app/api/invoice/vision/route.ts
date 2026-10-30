import { NextRequest, NextResponse } from 'next/server';
import { extractInvoiceFromMultimodal } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const additionalNotes = formData.get('notes') as string | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided in multipart request' },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = imageFile.type || 'image/jpeg';

    const specializedVisionPrompt = `You are an expert optical character recognition (OCR) and financial document vision pipeline for contractors, freelancers, and small businesses.
OCR and extract line items, quantities, totals, and sales tax from this receipt or handwritten work ticket.

Detailed instructions:
1. Carefully parse handwritten handwriting, store receipts, gas/hardware receipts, and field job tickets.
2. Filter out noisy or redundant lines (e.g. register numbers, barcode digits, card masking numbers).
3. Extract each purchased item or labor line with unit price and quantity.
4. Distinguish between subtotal, sales tax (extract tax percentage or dollar tax rate), discounts, and final total.
5. Identify the merchant/vendor who supplied the receipt or work ticket.
6. If the receipt has a customer or job reference name (e.g., "Job: Smith Residence"), map this to the customer.
${additionalNotes ? `Additional user instructions: "${additionalNotes}"` : ''}`;

    const extraction = await extractInvoiceFromMultimodal(
      buffer,
      mimeType,
      specializedVisionPrompt
    );

    // Calculate preliminary financial totals for the UI
    const subtotal = extraction.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);

    let discountAmount = 0;
    if (extraction.discount?.amount) {
      discountAmount = extraction.discount.amount;
    } else if (extraction.discount?.percent) {
      discountAmount = (subtotal * extraction.discount.percent) / 100;
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    const taxAmount = extraction.items.reduce((sum, item) => {
      const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      const rate = Number(item.taxRate) || 0;
      return sum + (lineTotal * rate) / 100;
    }, 0);

    const grandTotal = discountedSubtotal + taxAmount;

    return NextResponse.json({
      success: true,
      source: 'vision',
      extraction,
      computedTotals: {
        subtotal: Number(subtotal.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
      },
    });
  } catch (error: unknown) {
    console.error('Error processing vision OCR invoice endpoint:', error);
    const msg = error instanceof Error ? error.message : 'Vision OCR extraction failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
