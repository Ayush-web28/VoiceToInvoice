import { NextRequest, NextResponse } from 'next/server';
import { extractInvoiceFromMultimodal } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt text is required' },
        { status: 400 }
      );
    }

    const extraction = await extractInvoiceFromMultimodal(
      undefined,
      'text/plain',
      prompt
    );

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
      source: 'text',
      extraction,
      computedTotals: {
        subtotal: Number(subtotal.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
      },
    });
  } catch (error: unknown) {
    console.error('Error in text invoice extraction:', error);
    const msg = error instanceof Error ? error.message : 'Text extraction failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
