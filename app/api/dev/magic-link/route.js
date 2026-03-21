import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { MAGIC_LINK_FILE_PATH } from '@/lib/dev-auth';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  try {
    const data = await readFile(MAGIC_LINK_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return NextResponse.json({ hasLink: true, ...parsed });
  } catch {
    return NextResponse.json({ hasLink: false });
  }
}
