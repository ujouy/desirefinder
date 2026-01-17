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
      // Note: OpenService API endpoint may vary - check official docs
      try {
        const tokenResponse = await fetch('https://api-sg.aliexpress.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: appKey,
            client_secret: appSecret,
            code: code,
            redirect_uri: redirectUri,
          }),
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // Store the access token (you might want to save this to database)
          // For now, we'll just log it - you should update your .env.production
          console.log('Access token received:', tokenData.access_token);
          
          return NextResponse.redirect(
            new URL('/?success=aliexpress_connected', req.url)
          );
        } else {
          const errorData = await tokenResponse.text();
          console.error('Token exchange failed:', errorData);
          return NextResponse.redirect(
            new URL('/?error=token_exchange_failed', req.url)
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
