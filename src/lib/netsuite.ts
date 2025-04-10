import { createHash, randomBytes } from 'crypto';

// Types for OAuth responses
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface NetSuiteConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

// PKCE Utils
function generateCodeVerifier(): string {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = randomBytes(64);
  const result = new Array(64);
  
  for (let i = 0; i < 64; i++) {
    result[i] = validChars[bytes[i] % validChars.length];
  }
  
  return result.join('');
}

function generateCodeChallenge(verifier: string): string {
  const hash = createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return hash;
}

function generateState(): string {
  // Generate state with minimum 22 characters as required by NetSuite
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  for (let i = 0; i < 22; i++) {
    state += charset[Math.floor(Math.random() * charset.length)];
  }
  return state;
}

export class NetSuiteOAuth {
  private config: NetSuiteConfig;

  constructor(config: NetSuiteConfig) {
    this.config = config;
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  generateAuthUrl(accountId: string): { url: string; codeVerifier: string; state: string } {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();
    
    // Format account ID correctly - replace all underscores with hyphens and convert to lowercase
    const formattedAccountId = accountId.replace(/_/g, '-').toLowerCase();

    // Create params in exact order from documentation example
    const params = new URLSearchParams();
    params.append('scope', 'restlets rest_webservices');
    params.append('redirect_uri', this.config.redirectUri);
    params.append('response_type', 'code');
    params.append('client_id', this.config.clientId);
    params.append('state', state);
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', 'S256');
    params.append('prompt', 'login');

    const baseUrl = `https://${formattedAccountId}.app.netsuite.com/app/login/oauth2/authorize.nl`;

    return {
      url: `${baseUrl}?${params.toString()}`,
      codeVerifier,
      state
    };
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string, 
    codeVerifier: string,
    accountId: string
  ): Promise<TokenResponse> {
    // Format account ID correctly - replace all underscores with hyphens and convert to lowercase
    const formattedAccountId = accountId.replace(/_/g, '-').toLowerCase();
    
    const tokenEndpoint = `https://${formattedAccountId}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`;
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string, accountId: string): Promise<TokenResponse> {
    // Format account ID correctly - replace all underscores with hyphens and convert to lowercase
    const formattedAccountId = accountId.replace(/_/g, '-').toLowerCase();
    
    const tokenEndpoint = `https://${formattedAccountId}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`;
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Revoke refresh token
   */
  async revokeToken(token: string, accountId: string): Promise<void> {
    // Format account ID correctly - replace all underscores with hyphens and convert to lowercase
    const formattedAccountId = accountId.replace(/_/g, '-').toLowerCase();
    
    const revokeEndpoint = `https://${formattedAccountId}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/revoke`;
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    const response = await fetch(revokeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        token
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token revocation failed: ${error}`);
    }
  }
}

// Create singleton instance with environment variables
export const netsuiteOAuth = new NetSuiteOAuth({
  clientId: process.env.NEXT_PUBLIC_NETSUITE_CLIENT_ID!,
  clientSecret: process.env.NETSUITE_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_NETSUITE_REDIRECT_URI!
});
