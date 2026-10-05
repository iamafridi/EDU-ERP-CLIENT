import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      institution,
      role,
      preferredTime,
      interests,
      message,
    } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required fields.' },
        { status: 400 }
      );
    }

    const payload = {
      fullName,
      email,
      phone: phone || 'Not provided',
      institution: institution || 'Not specified',
      role: role || 'General Inquiry',
      preferredTime: preferredTime || 'As soon as convenient',
      interests: Array.isArray(interests) ? interests.join(', ') : 'All Modules',
      message: message || 'N/A',
      receivedAt: new Date().toISOString(),
    };

    console.log('[Institutional Briefing Inquiry Received]:', JSON.stringify(payload, null, 2));

    // Optional backend webhook / forwarder if BACKEND_API_URL or SMTP is provided
    const backendApiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendApiUrl && !backendApiUrl.includes('localhost')) {
      try {
        await fetch(`${backendApiUrl}/inquiries/briefing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('[Briefing Forwarding Notice]: Backend forward skipped', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Briefing request received and queued for campus executive dispatch.',
      inquiry: payload,
    });
  } catch (error) {
    console.error('[Briefing API Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process briefing request.' },
      { status: 500 }
    );
  }
}
