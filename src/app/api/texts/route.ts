import { NextResponse } from 'next/server';
import { createText } from '@/lib/db';

const generateId = () => {
  return Math.random().toString(36).substring(2, 8);
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, expiryMinutes } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (new Blob([content]).size > 102400) {
      return NextResponse.json({ error: 'Text size cannot exceed 100KB' }, { status: 400 });
    }

    const minutes = Number(expiryMinutes) || 10;
    if (minutes < 1 || minutes > 10) {
      return NextResponse.json({ error: 'Expiry must be between 1 and 10 minutes' }, { status: 400 });
    }

    const id = generateId();
    await createText(id, content, minutes);

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
