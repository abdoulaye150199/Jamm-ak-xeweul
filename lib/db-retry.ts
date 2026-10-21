const transientCodes = new Set(['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN', 'ENETUNREACH', 'EHOSTUNREACH', 'UND_ERR_CONNECT_TIMEOUT', '08000', '08003', '08006', '57P01', '57P02', '57P03']);

export function isTransientDatabaseError(error: unknown): boolean {
  const seen = new Set<unknown>();
  const pending = [error];
  while (pending.length) {
    const current = pending.pop();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    const candidate = current as { code?: string; name?: string; message?: string; cause?: unknown; sourceError?: unknown; errors?: unknown[] };
    if (candidate.code && transientCodes.has(candidate.code)) return true;
    if (candidate.name === 'TimeoutError' || candidate.message?.includes('fetch failed')) return true;
    pending.push(candidate.cause, candidate.sourceError, ...(candidate.errors ?? []));
  }
  return false;
}

// Retry reads only: a failed write may already have committed on the server.
export async function readDatabase<T>(operation: () => PromiseLike<T>, delay: (milliseconds: number) => Promise<void> = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= 2 || !isTransientDatabaseError(error)) throw error;
      await delay(200 * (attempt + 1));
    }
  }
}
