import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and message body are required' },
        { status: 400 }
      );
    }

    // Extract clean 10-digit Indian mobile number
    let digits = phone.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(-10);
    } else if (digits.length > 10) {
      digits = digits.slice(-10);
    }

    if (digits.length !== 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid Indian mobile number (${phone}). Please provide a 10-digit mobile number.` 
        },
        { status: 400 }
      );
    }

    // Determine Fast2SMS API Key from client header, body, or environment variable
    const clientKey = request.headers.get('x-fast2sms-key') || body.apiKey;
    const apiKey = clientKey || process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        simulated: true,
        phone: digits,
        error: 'Fast2SMS API Key is not configured. Go to Admin Settings -> SMS Gateway to enter your free Fast2SMS API Key to receive real SMS messages on your phone.',
        messageSample: message
      }, { status: 200 });
    }

    // Dispatch real SMS via Fast2SMS Quick Route (bulkV2)
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        numbers: digits,
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data && (data.return === true || data.status_code === 200)) {
      return NextResponse.json({
        success: true,
        provider: 'FAST2SMS',
        requestId: data.request_id || `req_${Date.now()}`,
        phone: digits,
        message: 'SMS successfully dispatched to mobile carrier via Fast2SMS',
        details: data
      });
    } else {
      const errMsg = data?.message?.[0] || data?.message || `HTTP ${response.status} from Fast2SMS`;
      return NextResponse.json({
        success: false,
        provider: 'FAST2SMS',
        phone: digits,
        error: errMsg,
        details: data
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[SMS API Route] Error dispatching SMS:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error dispatching SMS' },
      { status: 500 }
    );
  }
}
