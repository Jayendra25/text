import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface SharedText {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number;
}

const DB_FILE = process.env.VERCEL 
  ? path.join(os.tmpdir(), 'data.json') 
  : path.join(process.cwd(), 'data.json');

async function ensureDb() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({}), 'utf-8');
  }
}

export async function getDb(): Promise<Record<string, SharedText>> {
  await ensureDb();
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function saveDb(data: Record<string, SharedText>) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function createText(id: string, content: string, expiryMinutes: number): Promise<SharedText> {
  const db = await getDb();
  const now = Date.now();
  const expiresAt = now + expiryMinutes * 60 * 1000;
  
  const newText: SharedText = {
    id,
    content,
    createdAt: now,
    expiresAt,
  };
  
  db[id] = newText;
  await saveDb(db);
  return newText;
}

export async function getText(id: string): Promise<SharedText | null> {
  const db = await getDb();
  const text = db[id];
  
  if (!text) return null;
  
  if (Date.now() > text.expiresAt) {
    delete db[id];
    await saveDb(db);
    return null;
  }
  
  return text;
}

export async function updateText(id: string, content: string): Promise<SharedText | null> {
  const db = await getDb();
  const text = db[id];
  
  if (!text) return null;
  if (Date.now() > text.expiresAt) {
    delete db[id];
    await saveDb(db);
    return null;
  }
  
  text.content = content;
  db[id] = text;
  await saveDb(db);
  return text;
}
