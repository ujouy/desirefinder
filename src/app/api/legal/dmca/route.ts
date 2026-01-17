import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, copyrightOwner, infringedWork, infringingUrl, goodFaith } = body;

    if (!name || !email || !copyrightOwner || !infringedWork || !infringingUrl || !goodFaith) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 },
      );
    }

    const dmcaEmail = process.env.DMCA_EMAIL;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!dmcaEmail) {
      throw new Error('DMCA_EMAIL environment variable is required. Please set it in your .env file.');
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is required for sending DMCA emails. Please set it in your .env file.');
    }

    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'DMCA <noreply@desirefinder.com>',
      to: dmcaEmail,
      subject: `DMCA Takedown Request - ${copyrightOwner}`,
      html: `
        <h2>DMCA Takedown Request</h2>
        <p><strong>Requester Name:</strong> ${name}</p>
        <p><strong>Requester Email:</strong> ${email}</p>
        <p><strong>Copyright Owner:</strong> ${copyrightOwner}</p>
        <p><strong>Infringed Work:</strong> ${infringedWork}</p>
        <p><strong>Infringing URL:</strong> <a href="${infringingUrl}">${infringingUrl}</a></p>
        <p><strong>Good Faith Statement:</strong> ${goodFaith ? 'Yes' : 'No'}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'DMCA request received. We will process it within 48 hours.',
    });
  } catch (error) {
    console.error('Error processing DMCA request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
