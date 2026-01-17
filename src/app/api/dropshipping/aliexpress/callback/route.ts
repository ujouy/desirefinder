import { NextRequest, NextResponse } from 'next/server';

/**
 * OpenService AliExpress OAuth Callback Handler
 * 
 * This endpoint receives the authorization code when sellers authorize your app.
 * For dropshipping/product search, this may not be required, but it's good to have.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle error case
    if (error) {
      console.error('AliExpress OAuth error:', error);
      return NextResponse.redirect(
        new URL('/?error=aliexpress_auth_failed', req.url)
      );
    }

    // If we have an authorization code, exchange it for access token
    if (code) {
      const appKey = process.env.ALIEXPRESS_APP_KEY;
      const appSecret = process.env.ALIEXPRESS_APP_SECRET;
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/dropshipping/aliexpress/callback`;

      if (!appKey || !appSecret) {
        console.error('AliExpress credentials not configured');
        return NextResponse.json(
          { error: 'AliExpress credentials not configured' },
          { status: 500 }
        );
      }

      // Exchange authorization code for access token
      // OpenService AliExpress OAuth token endpoint
      try {
        // Try standard OAuth 2.0 token endpoint
        const tokenUrl = 'https://oauth.aliexpress.com/token';
        
        const tokenParams = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: appKey,
          client_secret: appSecret,
          code: code,
          redirect_uri: redirectUri,
        });

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // Extract tokens from response
          const accessToken = tokenData.access_token || tokenData.access_token;
          const refreshToken = tokenData.refresh_token;
          const expiresIn = tokenData.expires_in;
          
          // IMPORTANT: Display the access token so you can copy it
          // In production, you might want to store this securely in a database
          console.log('✅ Access Token Received!');
          console.log('Access Token:', accessToken);
          console.log('Refresh Token:', refreshToken);
          console.log('Expires In:', expiresIn, 'seconds');
          
          // Redirect to a page that displays the token (for easy copying)
          // Or return JSON with the token
          const successUrl = new URL('/?success=aliexpress_connected', req.url);
          successUrl.searchParams.set('access_token', accessToken);
          successUrl.searchParams.set('expires_in', expiresIn?.toString() || '');
          
          return NextResponse.redirect(successUrl);
        } else {
          const errorData = await tokenResponse.text();
          console.error('Token exchange failed:', errorData);
          console.error('Status:', tokenResponse.status);
          
          // Try alternative endpoint format
          console.log('Trying alternative token endpoint...');
          // You may need to check OpenService docs for the exact endpoint
          
          return NextResponse.redirect(
            new URL(`/?error=token_exchange_failed&details=${encodeURIComponent(errorData)}`, req.url)
          );
        }
      } catch (error) {
        console.error('Token exchange error:', error);
        return NextResponse.redirect(
          new URL('/?error=token_exchange_error', req.url)
        );
      }
    }

    // If no code, just redirect to home
    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error('Callback handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
