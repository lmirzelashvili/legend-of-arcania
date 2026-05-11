// Error Logger — captures all browser errors and sends them to the backend log

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const LOG_ENDPOINT = `${API_URL}/error-log`;
const BATCH_INTERVAL = 2000;

interface ErrorEntry {
  type: 'error' | 'unhandled-rejection' | 'console-error' | 'console-warn' | 'react-error' | 'network-error';
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  meta?: Record<string, any>;
}

let buffer: ErrorEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function enqueue(entry: ErrorEntry) {
  buffer.push(entry);
  if (!flushTimer) {
    flushTimer = setTimeout(flush, BATCH_INTERVAL);
  }
}

function flush() {
  flushTimer = null;
  if (buffer.length === 0) return;
  const batch = buffer;
  buffer = [];
  fetch(LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batch),
  }).catch(() => {
    // If backend is down, silently drop — don't cause more errors
  });
}

function formatError(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) return { message: err.message, stack: err.stack };
  return { message: String(err) };
}

// ─── Global error handler ───
window.addEventListener('error', (event) => {
  enqueue({
    type: 'error',
    message: event.message || String(event.error),
    stack: event.error?.stack,
    url: event.filename || window.location.href,
    timestamp: new Date().toISOString(),
    meta: { line: event.lineno, col: event.colno },
  });
});

// ─── Unhandled promise rejections ───
window.addEventListener('unhandledrejection', (event) => {
  const { message, stack } = formatError(event.reason);
  enqueue({
    type: 'unhandled-rejection',
    message,
    stack,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });
});

// ─── Console.error / console.warn interception ───
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  originalConsoleError.apply(console, args);
  enqueue({
    type: 'console-error',
    message: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });
};

console.warn = (...args: any[]) => {
  originalConsoleWarn.apply(console, args);
  enqueue({
    type: 'console-warn',
    message: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });
};

// ─── Export for React ErrorBoundary and manual use ───
export function logReactError(error: Error, componentStack?: string) {
  enqueue({
    type: 'react-error',
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    meta: { componentStack },
  });
}

export function logNetworkError(url: string, status: number, message: string) {
  enqueue({
    type: 'network-error',
    message: `${status} ${message}`,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    meta: { requestUrl: url, status },
  });
}
