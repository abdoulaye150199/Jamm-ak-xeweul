import 'server-only';

import { randomUUID } from 'crypto';

export function isBackendConfigured() {
  return Boolean(process.env.BACKEND_API_URL);
}

export async function proxyToBackend(request: Request, path: string, body?: unknown) {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, '');
  if (!baseUrl) throw new Error('BACKEND_API_URL est manquante.');

  const headers: Record<string, string> = {
    'x-request-id': request.headers.get('x-request-id') ?? randomUUID(),
  };
  const contentType = request.headers.get('content-type');
  const cookie = request.headers.get('cookie');
  if (contentType) headers['content-type'] = contentType;
  if (cookie) headers.cookie = cookie;

  const upstream = await fetch(`${baseUrl}${path}`, {
    method: request.method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const responseHeaders = new Headers();
  responseHeaders.set('cache-control', 'no-store');
  const upstreamContentType = upstream.headers.get('content-type');
  const setCookie = upstream.headers.get('set-cookie');
  if (upstreamContentType) responseHeaders.set('content-type', upstreamContentType);
  if (setCookie) responseHeaders.set('set-cookie', setCookie);
  return new Response(await upstream.text(), { status: upstream.status, headers: responseHeaders });
}
