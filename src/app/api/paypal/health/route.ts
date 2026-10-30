import { NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalCredentials } from '@/lib/paypal/auth';
import { generateInvoiceNumber } from '@/lib/paypal/invoices';

export async function GET() {
  try {
    const creds = getPayPalCredentials();
    let tokenAcquired = false;
    let nextInvoiceNumber = '';
    let errorMessage: string | null = null;

    if (creds.isConfigured) {
      try {
        const token = await getPayPalAccessToken();
        tokenAcquired = Boolean(token && !token.startsWith('SANDBOX_DEMO_TOKEN_'));
        nextInvoiceNumber = await generateInvoiceNumber();
      } catch (err: unknown) {
        errorMessage = err instanceof Error ? err.message : String(err);
      }
    } else {
      nextInvoiceNumber = await generateInvoiceNumber();
    }

    const maskedClientId = creds.clientId
      ? `${creds.clientId.substring(0, 6)}...${creds.clientId.substring(creds.clientId.length - 4)}`
      : 'NOT_SET';

    return NextResponse.json({
      status: creds.isConfigured ? (tokenAcquired ? 'HEALTHY' : 'AUTH_WARNING') : 'SIMULATION_MODE',
      timestamp: new Date().toISOString(),
      paypal: {
        apiBase: creds.apiBase,
        isConfigured: creds.isConfigured,
        clientIdMasked: maskedClientId,
        tokenAcquired,
        nextInvoiceNumberSample: nextInvoiceNumber,
        error: errorMessage,
      },
      message: creds.isConfigured
        ? tokenAcquired
          ? 'PayPal Sandbox Invoicing API v2 authenticated and operational.'
          : 'PayPal credentials present but authentication returned a warning. Verify Sandbox credentials in .env.'
        : 'PayPal credentials not set in .env. Running in Zero-Config Sandbox Simulation mode.',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: msg,
      },
      { status: 500 }
    );
  }
}
