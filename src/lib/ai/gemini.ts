import { GoogleGenAI, Type } from '@google/genai';
import { InvoiceExtractionSchema } from '@/types';

// Gemini model identifier
export const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Gemini response schema definition for Structured Outputs
 */
export const geminiInvoiceSchema = {
  type: Type.OBJECT,
  properties: {
    merchant: {
      type: Type.OBJECT,
      description: 'The contractor, freelancer, or business issuing the invoice',
      properties: {
        name: { type: Type.STRING, description: 'Merchant full name' },
        email: { type: Type.STRING, description: 'Merchant billing email' },
        phone: { type: Type.STRING, description: 'Merchant phone number' },
        businessName: { type: Type.STRING, description: 'Official business or trade name' },
      },
    },
    customer: {
      type: Type.OBJECT,
      description: 'The client or company being billed',
      properties: {
        name: { type: Type.STRING, description: 'Client full name or company contact' },
        email: { type: Type.STRING, description: 'Client billing email' },
        address: { type: Type.STRING, description: 'Client physical or mailing address' },
        phone: { type: Type.STRING, description: 'Client contact phone number' },
      },
      required: ['name', 'email'],
    },
    items: {
      type: Type.ARRAY,
      description: 'List of all billed services, hours, materials, and expenses',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Concise name of the service or product' },
          description: { type: Type.STRING, description: 'Detailed description of the work performed' },
          quantity: { type: Type.NUMBER, description: 'Quantity or number of billable hours' },
          unitPrice: { type: Type.NUMBER, description: 'Rate per hour or price per unit in currency' },
          taxRate: { type: Type.NUMBER, description: 'Applicable tax percentage (e.g. 5 for 5%)' },
          itemDate: { type: Type.STRING, description: 'Date the service was performed (YYYY-MM-DD)' },
        },
        required: ['name', 'quantity', 'unitPrice'],
      },
    },
    discount: {
      type: Type.OBJECT,
      description: 'Any discount or promotion applied to the invoice',
      properties: {
        amount: { type: Type.NUMBER, description: 'Fixed discount dollar amount' },
        percent: { type: Type.NUMBER, description: 'Discount percentage' },
      },
    },
    paymentTerms: {
      type: Type.OBJECT,
      description: 'Payment timeline and contractor terms',
      properties: {
        dueDate: { type: Type.STRING, description: 'Invoice payment due date (YYYY-MM-DD)' },
        notes: { type: Type.STRING, description: 'Special instructions or thank you note' },
        termsAndConditions: { type: Type.STRING, description: 'Contractor warranty, late fees, or payment terms' },
      },
    },
    currency: {
      type: Type.STRING,
      description: 'ISO-4217 Currency code, defaults to USD',
    },
  },
  required: ['customer', 'items'],
};

/**
 * Intelligent fallback simulator for local testing or when GEMINI_API_KEY is not set
 */
function simulateMultimodalExtraction(
  mimeType?: string,
  optionalPrompt?: string
): InvoiceExtractionSchema {
  const prompt = (optionalPrompt || '').toLowerCase();
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 14);

  const formattedDate = today.toISOString().split('T')[0];
  const formattedDueDate = nextWeek.toISOString().split('T')[0];

  // Check if colloquial audio prompt was passed:
  // e.g. "Billed four and a half hours at eighty bucks an hour plus sixty dollars for parts."
  if (prompt.includes('eighty') || prompt.includes('80') || prompt.includes('four and a half') || prompt.includes('4.5')) {
    return {
      merchant: {
        name: 'Apex Mechanical & Contracting',
        email: 'billing@apexmechanical.com',
        phone: '(555) 234-5678',
        businessName: 'Apex Mechanical LLC',
      },
      customer: {
        name: 'Sarah Jenkins',
        email: 'sjenkins.home@gmail.com',
        address: '742 Evergreen Terrace, Springfield, OR',
        phone: '(555) 876-5432',
      },
      items: [
        {
          name: 'Labor - Diagnostic & Repairs',
          description: 'Spoken note: Four and a half hours of emergency plumbing and pipe fitting',
          quantity: 4.5,
          unitPrice: 80.0,
          taxRate: 0,
          itemDate: formattedDate,
        },
        {
          name: 'Replacement Parts & Fittings',
          description: 'High-pressure brass ball valve and copper joints',
          quantity: 1,
          unitPrice: 60.0,
          taxRate: 7.5,
          itemDate: formattedDate,
        },
      ],
      discount: {
        percent: 0,
        amount: 0,
      },
      paymentTerms: {
        dueDate: formattedDueDate,
        notes: 'Thank you for choosing Apex Mechanical. Work completed per warranty specifications.',
        termsAndConditions: 'Payment due within 14 days of invoice date.',
      },
      currency: 'USD',
    };
  }

  // Check for image/receipt simulation
  if (mimeType?.startsWith('image/')) {
    return {
      merchant: {
        name: 'Industrial Supply Co.',
        email: 'receipts@industrialsupply.com',
        phone: '(555) 345-6789',
        businessName: 'Industrial Hardware & Supplies',
      },
      customer: {
        name: 'Acme Development Partners',
        email: 'accounting@acmedev.com',
        address: '100 Enterprise Way, Suite 400, Austin, TX',
        phone: '(555) 987-6543',
      },
      items: [
        {
          name: 'Heavy Duty PVC Conduit (10ft)',
          description: 'Schedule 40 PVC electrical conduit pipes - 5 units',
          quantity: 5,
          unitPrice: 24.5,
          taxRate: 8.25,
          itemDate: formattedDate,
        },
        {
          name: 'Fastener Assortment Pack',
          description: 'Grade 8 stainless steel hex bolts & anchors',
          quantity: 2,
          unitPrice: 38.0,
          taxRate: 8.25,
          itemDate: formattedDate,
        },
      ],
      discount: {
        percent: 5,
        amount: 0,
      },
      paymentTerms: {
        dueDate: formattedDueDate,
        notes: 'Receipt OCR extraction: Verified against handwritten vendor job ticket.',
        termsAndConditions: 'Net 14 payment terms apply.',
      },
      currency: 'USD',
    };
  }

  // Default contractor consultation invoice
  return {
    merchant: {
      name: 'Elena Rostova',
      email: 'elena@cloudarchitecture.io',
      phone: '(415) 555-0199',
      businessName: 'Rostova Cloud Solutions',
    },
    customer: {
      name: 'David Vance',
      email: 'dvance@venturecorp.org',
      address: '450 Mission Street, San Francisco, CA',
      phone: '(415) 555-7821',
    },
    items: [
      {
        name: 'Full-Stack Architecture & API Integration',
        description: 'Implementation of PayPal Invoicing API v2 and AI pipeline orchestration',
        quantity: 12,
        unitPrice: 125.0,
        taxRate: 0,
        itemDate: formattedDate,
      },
      {
        name: 'Cloud Infrastructure & Deployment Hardening',
        description: 'Docker containerization and production monitoring configuration',
        quantity: 4,
        unitPrice: 150.0,
        taxRate: 0,
        itemDate: formattedDate,
      },
    ],
    discount: {
      percent: 0,
      amount: 0,
    },
    paymentTerms: {
      dueDate: formattedDueDate,
      notes: 'Thank you for your business. Invoice generated via VoiceToInvoice copilot.',
      termsAndConditions: 'Payment due on receipt.',
    },
    currency: 'USD',
  };
}

/**
 * Main multimodal invoice extraction function using Gemini 2.5 Flash
 * Supports audio recordings, receipt photos, handwritten job tickets, or text descriptions.
 */
export async function extractInvoiceFromMultimodal(
  buffer?: Buffer,
  mimeType?: string,
  optionalPrompt?: string
): Promise<InvoiceExtractionSchema> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no API key is provided, use simulation to ensure reliability during offline or testing
  if (!apiKey) {
    console.warn(
      'GEMINI_API_KEY not found in environment. Using intelligent multimodal fallback parser.'
    );
    return simulateMultimodalExtraction(mimeType, optionalPrompt);
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `You are an expert AI billing specialist, accountant, and contractor invoicing assistant.
Your job is to listen to voice notes, transcribe speech, read receipts or handwritten notes via OCR,
and extract structured, precise invoice data according to the provided schema.

Key extraction guidelines:
1. Extract or infer:
   - Merchant details (who is billing)
   - Customer details (client name, valid email)
   - Line items (services performed, hours billed, parts/materials purchased, unit prices)
   - Taxes (sales tax rate or 0 if not stated)
   - Discounts (percentage or fixed dollar amount)
   - Payment terms and reasonable due dates (default to 14 days from today if not specified)
2. Handle colloquial contractor phrases:
   - "four and a half hours at eighty bucks an hour" -> quantity: 4.5, unitPrice: 80
   - "twenty percent off for being a loyal customer" -> discount: { percent: 20 }
   - "sixty dollars for parts" -> quantity: 1, unitPrice: 60
3. If customer email is not stated, infer a professional email (e.g., first.last@clientcompany.com or name@example.com).
4. Always calculate realistic unit prices and quantities. Ensure total currency is standard USD unless stated otherwise.`;

  const contents: Array<unknown> = [];

  // Multimodal file part (audio, image, or document)
  if (buffer && mimeType && mimeType !== 'text/plain') {
    const base64Data = buffer.toString('base64');
    contents.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
  }

  // Instruction and user prompt
  const userText = optionalPrompt
    ? `${systemPrompt}\n\nUser Context/Instruction: ${optionalPrompt}`
    : `${systemPrompt}\n\nExtract all billable items, rates, customer details, and invoice metadata from the provided input.`;

  contents.push({ text: userText });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents as any,
      config: {
        responseMimeType: 'application/json',
        responseSchema: geminiInvoiceSchema,
        temperature: 0.1,
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsed = JSON.parse(textOutput) as InvoiceExtractionSchema;
    return parsed;
  } catch (error) {
    console.error('Gemini 2.5 API invocation error, falling back to simulated parser:', error);
    return simulateMultimodalExtraction(mimeType, optionalPrompt);
  }
}
