/**
 * PayPal OAuth2 Token Manager with in-memory caching
 */

interface CachedToken {
  accessToken: string;
  expiresAt: number; // unix timestamp in ms
}

let cachedToken: CachedToken | null = null;

export const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

export function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim() || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() || '';
  const isConfigured = Boolean(clientId && clientSecret);

  return {
    clientId,
    clientSecret,
    isConfigured,
    apiBase: PAYPAL_API_BASE,
  };
}

/**
 * Retrieves a valid OAuth2 Bearer token from PayPal Sandbox with caching.
 * Refreshes 60 seconds before expiration.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret, isConfigured, apiBase } = getPayPalCredentials();

  if (!isConfigured) {
    // If not yet configured, return a simulated sandbox token for development/demo safety
    console.warn(
      'PayPal credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) not fully configured. Using sandbox simulation mode.'
    );
    return 'SANDBOX_DEMO_TOKEN_' + Buffer.from(`${clientId || 'demo'}`).toString('base64');
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `PayPal OAuth2 token request failed: HTTP ${response.status} - ${errorText}`
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number; // in seconds
  };

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

/**
 * Clear cached token (useful for re-authenticating or testing)
 */
export function clearTokenCache() {
  cachedToken = null;
}
