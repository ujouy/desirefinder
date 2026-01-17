import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker/Nginx
 */
export async function GET() {
  try {
    // Basic health check - can be extended to check database, etc.
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'desirefinder',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
