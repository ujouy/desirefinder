import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate OpenService AliExpress Authorization URL
 * 
 * This endpoint generates the OAuth authorization URL that you need to visit
 * to authorize your app and get an access token.
 */
export async function GET(req: NextRequest) {
  try {
    const appKey = process.env.ALIEXPRESS_APP_KEY;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/dropshipping/aliexpress/callback`;
    const state = `desirefinder_${Date.now()}`;

  if (!appKey) {
      return NextResponse.json(
        { 
          error: 'ALIEXPRESS_APP_KEY not configured',
          message: 'Please set ALIEXPRESS_APP_KEY in your .env.production file'
        },
        { status: 500 }
      );
    }

    // Generate authorization URL
    // OpenService AliExpress uses standard OAuth 2.0
    const authUrl = new URL('https://auth.aliexpress.com/oauth/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', appKey);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'api'); // Adjust scope based on your needs

    return NextResponse.json({
      authorizationUrl: authUrl.toString(),
      instructions: [
        '1. Copy the authorizationUrl above',
        '2. Open it in your browser',
        '3. Login to AliExpress and authorize the app',
        '4. You will be redirected to the callback URL with an authorization code',
        '5. The callback endpoint will exchange the code for an access token',
        '6. Check the response or server logs for your access_token'
      ],
      appKey: appKey,
      redirectUri: redirectUri,
      state: state,
    });
  } catch (error) {
    console.error('Error generating authorization URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
