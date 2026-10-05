import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Minimal health check handler for the local Vite dev server wrapper.
 * All application data, authentication, and storage are handled directly by Supabase.
 */
export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', database: 'supabase-direct' }));
    return true;
  }
  return false;
}
