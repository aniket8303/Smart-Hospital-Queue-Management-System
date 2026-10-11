import { NextResponse } from 'next/server';

// Server-side in-memory queue store shared across all connected clients on LAN
let serverQueue: any[] = [];
let serverCompleted: any[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token) {
    const item = serverQueue.find((q) => q.tokenNumber === token);
    const completedItem = serverCompleted.find((q) => q.tokenNumber === token);
    return NextResponse.json({
      success: true,
      found: !!(item || completedItem),
      item: item || completedItem || null,
      status: item?.status || completedItem?.status || 'NOT_FOUND',
    });
  }

  return NextResponse.json({
    success: true,
    queue: serverQueue,
    completedQueue: serverCompleted,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, queue, completedQueue, item } = body;

    if (action === 'SYNC' && Array.isArray(queue)) {
      serverQueue = queue;
      if (Array.isArray(completedQueue)) {
        serverCompleted = completedQueue;
      }
      return NextResponse.json({ success: true, count: serverQueue.length });
    }

    if (action === 'ADD' && item) {
      // Avoid duplicate token numbers
      const exists = serverQueue.some((q) => q.tokenNumber === item.tokenNumber);
      if (!exists) {
        serverQueue.push(item);
      }
      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
