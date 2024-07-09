import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'fr_words.txt');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const words = fileContents.split('\n').filter(Boolean);
    return NextResponse.json(words);
  } catch (error) {
    console.error('Error loading words:', error);
    return NextResponse.json([], { status: 500 });
  }
}
