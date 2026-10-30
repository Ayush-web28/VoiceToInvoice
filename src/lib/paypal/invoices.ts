import { getPayPalAccessToken, getPayPalCredentials, PAYPAL_API_BASE } from './auth';
import { InvoiceData } from '@/types';

export interface PayPalInvoiceNumberResponse {
  invoice_number: string;
}

export interface PayPalCreateDraftResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalInvoiceDetailsResponse {
  id: string;
  status: string;
  detail: {
    invoice_number: string;
    invoice_date: string;
    currency_code: string;
    payment_term?: {
      term_type?: string;
      due_date?: string;
    };
    note?: string;
    terms_and_conditions?: string;
  };
  invoicer?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
    business_name?: string;
  };
  primary_recipients?: Array<{
    billing_info?: {
      name?: { given_name?: string; surname?: string };
      email_address?: string;
    };
  }>;
  items?: Array<{
    name: string;
    description?: string;
    quantity: string;
    unit_amount: { currency_code: string; value: string };
  }>;
  amount?: {
    currency_code: string;
    value: string;
    breakdown?: {
      item_total?: { currency_code: string; value: string };
      tax_total?: { currency_code: string; value: string };
      discount?: { invoice_discount?: { percent?: string; amount?: { currency_code: string; value: string } } };
    };
  };
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * Generate next sequential invoice number from PayPal Invoicing API v2
 * GET /v2/invoicing/generate-next-invoice-number
 */
export async function generateInvoiceNumber(): Promise<string> {
  const { isConfigured } = getPayPalCredentials();

  if (!isConfigured) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `INV2-VTI-${randomSuffix}`;
  }

  try {
    const token = await getPayPalAccessToken();
    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/invoicing/generate-next-invoice-number`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('PayPal invoice number endpoint returned status:', response.status);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return `INV2-VTI-${randomSuffix}`;
    }

    const data = (await response.json()) as PayPalInvoiceNumberResponse;
    return data.invoice_number;
  } catch (error) {
    console.error('Failed to generate invoice number from PayPal API, falling back to local generator:', error);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `INV2-VTI-${randomSuffix}`;
  }
}

/**
 * Transforms internal InvoiceData into PayPal v2 invoice format
 */
export function formatPayPalInvoicePayload(invoice: InvoiceData) {
  const customerNameParts = (invoice.customer.name || 'Valued Customer').trim().split(' ');
  const givenName = customerNameParts[0] || 'Valued';
  const surname = customerNameParts.slice(1).join(' ') || 'Customer';

  const merchantNameParts = (invoice.merchant.name || 'Invoice Merchant').trim().split(' ');
  const merchantGivenName = merchantNameParts[0] || 'Invoice';
  const merchantSurname = merchantNameParts.slice(1).join(' ') || 'Merchant';

  const formattedItems = invoice.items.map((item) => ({
    name: item.name || 'Service / Product',
    description: item.description || '',
    quantity: String(item.quantity || 1),
    unit_amount: {
      currency_code: invoice.currency || 'USD',
      value: (Number(item.unitPrice) || 0).toFixed(2),
    },
    ...(item.taxRate && item.taxRate > 0
      ? {
          tax: {
            name: 'Tax',
            percent: String(item.taxRate),
          },
        }
      : {}),
  }));

  const payload: Record<string, unknown> = {
    detail: {
      invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.invoiceDate || new Date().toISOString().split('T')[0],
      currency_code: invoice.currency || 'USD',
      note: invoice.paymentTerms.notes || 'Thank you for your business!',
      terms_and_conditions:
        invoice.paymentTerms.termsAndConditions || 'Payment due per agreed payment schedule.',
      payment_term: {
        term_type: invoice.paymentTerms.termType || 'DUE_ON_DATE_SPECIFIED',
        due_date: invoice.paymentTerms.dueDate || invoice.invoiceDate,
      },
    },
    invoicer: {
      name: {
        given_name: merchantGivenName,
        surname: merchantSurname,
      },
      business_name: invoice.merchant.businessName || 'VoiceToInvoice Contractor Services',
      email_address: invoice.merchant.email || 'billing@voicetoinvoice.app',
      ...(invoice.merchant.phone
        ? {
            phones: [
              {
                country_code: '001',
                national_number: invoice.merchant.phone.replace(/\D/g, ''),
                phone_type: 'WORK',
              },
            ],
          }
        : {}),
    },
    primary_recipients: [
      {
        billing_info: {
          name: {
            given_name: givenName,
            surname: surname,
          },
          email_address: invoice.customer.email,
        },
      },
    ],
    items: formattedItems,
    configuration: {
      allow_tip: false,
      tax_calculated_after_discount: true,
      tax_inclusive: false,
    },
  };

  // Add discount if present
  if (invoice.discount) {
    if (invoice.discount.percent && invoice.discount.percent > 0) {
      (payload.detail as Record<string, unknown>).discount = {
        percent: String(invoice.discount.percent),
      };
    } else if (invoice.discount.amount && invoice.discount.amount > 0) {
      (payload.detail as Record<string, unknown>).discount = {
        amount: {
          currency_code: invoice.currency || 'USD',
          value: invoice.discount.amount.toFixed(2),
        },
      };
    }
  }

  return payload;
}

/**
 * Creates a Draft Invoice in PayPal Invoicing API v2
 * POST /v2/invoicing/invoices
 */
export async function createDraftInvoice(
  invoiceData: InvoiceData
): Promise<PayPalCreateDraftResponse> {
  const { isConfigured } = getPayPalCredentials();

  if (!isConfigured) {
    const mockId = `INV2-SIM-${Date.now().toString(36).toUpperCase()}`;
    return {
      id: mockId,
      status: 'DRAFT',
      links: [
        {
          href: `https://www.sandbox.paypal.com/invoice/p/#${mockId}`,
          rel: 'payer-view-url',
          method: 'GET',
        },
        {
          href: `${PAYPAL_API_BASE}/v2/invoicing/invoices/${mockId}/send`,
          rel: 'send',
          method: 'POST',
        },
      ],
    };
  }

  const token = await getPayPalAccessToken();
  const payload = formatPayPalInvoicePayload(invoiceData);

  const response = await fetch(`${PAYPAL_API_BASE}/v2/invoicing/invoices`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(
      `Failed to create PayPal draft invoice: HTTP ${response.status} - ${errorDetails}`
    );
  }

  return (await response.json()) as PayPalCreateDraftResponse;
}

/**
 * Sends/dispatches an invoice to the client via PayPal Invoicing API v2
 * POST /v2/invoicing/invoices/{invoiceId}/send
 */
export async function sendInvoice(
  invoiceId: string
): Promise<{ success: boolean; paymentUrl: string }> {
  const { isConfigured } = getPayPalCredentials();

  if (!isConfigured || invoiceId.startsWith('INV2-SIM-')) {
    const simulatedPaymentUrl = `https://www.sandbox.paypal.com/invoice/p/#${invoiceId}`;
    return {
      success: true,
      paymentUrl: simulatedPaymentUrl,
    };
  }

  const token = await getPayPalAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/invoicing/invoices/${invoiceId}/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        send_to_invoicer: true,
      }),
    }
  );

  if (!response.ok && response.status !== 202 && response.status !== 200) {
    const errorDetails = await response.text();
    throw new Error(
      `Failed to send PayPal invoice: HTTP ${response.status} - ${errorDetails}`
    );
  }

  // Fetch updated invoice to retrieve the definitive payer-view-url
  try {
    const updated = await getInvoice(invoiceId);
    const payerLink = updated.links?.find((l) => l.rel === 'payer-view');
    return {
      success: true,
      paymentUrl: payerLink?.href || `https://www.sandbox.paypal.com/invoice/p/#${invoiceId}`,
    };
  } catch {
    return {
      success: true,
      paymentUrl: `https://www.sandbox.paypal.com/invoice/p/#${invoiceId}`,
    };
  }
}

/**
 * Get full invoice details from PayPal Invoicing API v2
 * GET /v2/invoicing/invoices/{invoiceId}
 */
export async function getInvoice(
  invoiceId: string
): Promise<PayPalInvoiceDetailsResponse> {
  const { isConfigured } = getPayPalCredentials();

  if (!isConfigured || invoiceId.startsWith('INV2-SIM-')) {
    return {
      id: invoiceId,
      status: 'SENT',
      detail: {
        invoice_number: invoiceId,
        invoice_date: new Date().toISOString().split('T')[0],
        currency_code: 'USD',
      },
      links: [
        {
          href: `https://www.sandbox.paypal.com/invoice/p/#${invoiceId}`,
          rel: 'payer-view',
          method: 'GET',
        },
      ],
    };
  }

  const token = await getPayPalAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/invoicing/invoices/${invoiceId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Failed to retrieve PayPal invoice ${invoiceId}: HTTP ${response.status} - ${errText}`
    );
  }

  return (await response.json()) as PayPalInvoiceDetailsResponse;
}

/**
 * Cancel an invoice in PayPal Invoicing API v2
 * POST /v2/invoicing/invoices/{invoiceId}/cancel
 */
export async function cancelInvoice(
  invoiceId: string,
  reason: string = 'Invoice cancelled by merchant'
): Promise<{ success: boolean }> {
  const { isConfigured } = getPayPalCredentials();

  if (!isConfigured || invoiceId.startsWith('INV2-SIM-')) {
    return { success: true };
  }

  const token = await getPayPalAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/invoicing/invoices/${invoiceId}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Invoice Cancelled',
        note: reason,
        send_to_invoicer: true,
        send_to_recipient: true,
      }),
    }
  );

  if (!response.ok && response.status !== 204 && response.status !== 200) {
    const err = await response.text();
    throw new Error(`Failed to cancel PayPal invoice: HTTP ${response.status} - ${err}`);
  }

  return { success: true };
}
