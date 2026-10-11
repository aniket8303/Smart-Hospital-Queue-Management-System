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

    // Sanitize message body (strip non-standard characters like tildes that some telco gateways reject)
    const sanitizedMessage = message.replace(/[~]/g, '').trim();

    // Dispatch real SMS via Fast2SMS Quick Route (bulkV2)
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: sanitizedMessage,
        language: 'english',
        flash: 0,
        numbers: digits,
      }),
    });

    const data = await response.json().catch(() => null);
    console.log('[Fast2SMS Gateway Response]:', response.status, data);

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
      let errMsg = 'Failed to dispatch SMS';
      if (Array.isArray(data?.message)) {
        errMsg = data.message.join('; ');
      } else if (typeof data?.message === 'string') {
        errMsg = data.message;
      } else if (data?.error) {
        errMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else {
        errMsg = `HTTP ${response.status} from Fast2SMS carrier`;
      }

      const isRechargeRequired = errMsg.toLowerCase().includes('100 inr') || errMsg.toLowerCase().includes('transaction of 100');

      return NextResponse.json({
        success: false,
        provider: 'FAST2SMS',
        phone: digits,
        error: isRechargeRequired
          ? 'Fast2SMS requires a one-time ₹100 wallet recharge on fast2sms.com to unlock automated API sending.'
          : errMsg,
        isRechargeRequired,
        rawCarrierMessage: errMsg,
        simulated: isRechargeRequired,
        smsDetails: {
          phone: digits,
          body: sanitizedMessage,
        },
        details: data
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('[SMS API Route] Error dispatching SMS:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error dispatching SMS' },
      { status: 500 }
    );
  }
}
