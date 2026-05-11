import fs from 'fs';
import path from 'path';

const LOG_FILE = path.resolve(process.cwd(), 'client-errors.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB max log size
const MAX_BATCH_SIZE = 50;

interface ClientError {
  type: 'error' | 'unhandled-rejection' | 'console-error' | 'console-warn' | 'react-error' | 'network-error';
  message: string;
  stack?: string;
  url?: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export function appendErrors(raw: unknown[]): Promise<void> {
  const errors: ClientError[] = raw.slice(0, MAX_BATCH_SIZE) as ClientError[];

  // Rotate log if too large
  try {
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_LOG_SIZE) {
      const rotated = LOG_FILE + '.old';
      if (fs.existsSync(rotated)) fs.unlinkSync(rotated);
      fs.renameSync(LOG_FILE, rotated);
    }
  } catch { /* ignore rotation errors */ }

  const lines = errors.map(err => {
    const entry = {
      type: String(err.type || 'unknown').slice(0, 50),
      message: String(err.message || '').slice(0, 2000),
      stack: err.stack ? String(err.stack).slice(0, 4000) : undefined,
      url: err.url ? String(err.url).slice(0, 500) : undefined,
      timestamp: err.timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };
    return JSON.stringify(entry);
  });

  return new Promise((resolve, reject) => {
    fs.appendFile(LOG_FILE, lines.join('\n') + '\n', (fsErr) => {
      if (fsErr) reject(fsErr);
      else resolve();
    });
  });
}

export function readErrors(): { errors: unknown[] } {
  if (!fs.existsSync(LOG_FILE)) {
    return { errors: [] };
  }

  const raw = fs.readFileSync(LOG_FILE, 'utf-8').trim();
  if (!raw) return { errors: [] };

  const errors = raw.split('\n').map(line => {
    try { return JSON.parse(line); } catch { return { raw: line }; }
  });
  return { errors };
}

export function clearErrors(): void {
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }
}
