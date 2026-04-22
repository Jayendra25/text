import { NextResponse } from 'next/server';
import { getText, updateText } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const text = await getText(id);

    if (!text) {
      return NextResponse.json({ error: 'Text not found or expired' }, { status: 404 });
    }

    return NextResponse.json({ success: true, text }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (new Blob([content]).size > 102400) {
      return NextResponse.json({ error: 'Text size cannot exceed 100KB' }, { status: 400 });
    }

    const updatedText = await updateText(id, content);

    if (!updatedText) {
      return NextResponse.json({ error: 'Text not found or expired' }, { status: 404 });
    }

    return NextResponse.json({ success: true, text: updatedText }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
