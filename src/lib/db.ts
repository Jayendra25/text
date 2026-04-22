export interface SharedText {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number;
}

declare global {
  var __texts_db: Record<string, SharedText> | undefined;
}

if (!global.__texts_db) {
  global.__texts_db = {};
}

export async function getDb(): Promise<Record<string, SharedText>> {
  if (!global.__texts_db) global.__texts_db = {};
  return global.__texts_db;
}

export async function saveDb(data: Record<string, SharedText>) {
  global.__texts_db = data;
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
