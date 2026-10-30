import { NextRequest, NextResponse } from 'next/server';
import { extractInvoiceFromMultimodal } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const additionalNotes = formData.get('notes') as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided in multipart request' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = audioFile.type || 'audio/webm';

    const specializedContractorPrompt = `You are processing a live audio voice recording from a contractor, freelancer, or field technician.
Listen carefully to the audio and extract billable hours, rates, material costs, client information, and discounts into structured invoice data.

Pay close attention to colloquial contractor and trade speech, for example:
- "Billed four and a half hours at eighty bucks an hour plus sixty dollars for parts."
- "Met with client Sarah at 742 Evergreen, spent 3 hours fixing the boiler at $95/hr, plus $120 for replacement valves."
- "Give them a ten percent discount for being a recurring client."

If specific business or client names/emails are mentioned, map them accurately.
If merchant info is not spoken, default to "VoiceToInvoice Contractor Services".
${additionalNotes ? `Additional context provided by user: "${additionalNotes}"` : ''}`;

    const extraction = await extractInvoiceFromMultimodal(
      buffer,
      mimeType,
      specializedContractorPrompt
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
      source: 'voice',
      extraction,
      computedTotals: {
        subtotal: Number(subtotal.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
      },
    });
  } catch (error: unknown) {
    console.error('Error processing voice-to-invoice endpoint:', error);
    const msg = error instanceof Error ? error.message : 'Voice extraction failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
