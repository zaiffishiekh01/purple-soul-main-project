import { mkdir, unlink, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const baseDir = path.join(process.cwd(), 'storage');

function safeSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9._/-]/g, '_');
}

export function getStoragePath(bucket: string, filePath: string): string {
  const safeBucket = safeSegment(bucket);
  const safePath = safeSegment(filePath);
  return path.join(baseDir, safeBucket, safePath);
}

export async function saveFile(bucket: string, filePath: string, file: File, upsert = false): Promise<void> {
  const target = getStoragePath(bucket, filePath);
  const dir = path.dirname(target);
  await mkdir(dir, { recursive: true });
  if (!upsert && existsSync(target)) {
    throw new Error(`File already exists at ${filePath}`);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(target, bytes);
}

export async function removeFiles(bucket: string, filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    const target = getStoragePath(bucket, filePath);
    if (existsSync(target)) {
      await unlink(target);
    }
  }
}

