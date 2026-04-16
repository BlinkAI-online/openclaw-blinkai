export type BlinkAiClientConfig = {
  baseUrl: string;
  apiToken?: string | null;
  connectUrl?: string | null;
  relayAgent?: boolean;
};

const connectPromises = new Map<string, Promise<void>>();

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, '');
}

function buildConnectEndpoint(config: BlinkAiClientConfig): string | null {
  const token = config.apiToken?.trim();
  if (!token) {
    return null;
  }
  const explicitConnectUrl = config.connectUrl?.trim();
  if (explicitConnectUrl) {
    if (explicitConnectUrl.includes('/auth/agent-onboarding/openclaw/connect/')) {
      return explicitConnectUrl;
    }
    if (explicitConnectUrl.endsWith('/')) {
      return `${explicitConnectUrl}${encodeURIComponent(token)}`;
    }
    return `${explicitConnectUrl}/${encodeURIComponent(token)}`;
  }
  const normalizedBaseUrl = normalizeBaseUrl(config.baseUrl);
  const authBaseUrl = normalizedBaseUrl.replace(/\/api\/v1\/openclaw\/v1$/, '');
  if (!authBaseUrl || authBaseUrl === normalizedBaseUrl) {
    return null;
  }
  return `${authBaseUrl}/api/v1/auth/agent-onboarding/openclaw/connect/${encodeURIComponent(token)}`;
}

async function ensureBlinkAgentConnected(config: BlinkAiClientConfig): Promise<void> {
  const endpoint = buildConnectEndpoint(config);
  if (!endpoint) {
    return;
  }
  const cacheKey = `${normalizeBaseUrl(config.baseUrl)}::${config.apiToken ?? ''}`;
  const existing = connectPromises.get(cacheKey);
  if (existing) {
    return existing;
  }
  const connectPromise = (async () => {
    const response = await fetch(endpoint, { method: 'POST' });
    if (!response.ok) {
      let detail = `BlinkAI connect failed with ${response.status}`;
      try {
        const payload = (await response.json()) as { detail?: string };
        if (payload.detail) {
          detail = payload.detail;
        }
      } catch {
        // ignore json parse failures for non-json error responses
      }
      throw new Error(detail);
    }
  })();
  connectPromises.set(cacheKey, connectPromise);
  try {
    await connectPromise;
  } catch (error) {
    connectPromises.delete(cacheKey);
    throw error;
  }
}

export async function blinkRequest<T>(
  config: BlinkAiClientConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  await ensureBlinkAgentConnected(config);
  const headers = new Headers(init?.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (config.apiToken) {
    headers.set('X-Blink-OpenClaw-Token', config.apiToken);
  }
  const response = await fetch(`${normalizeBaseUrl(config.baseUrl)}${path}`, {
    ...init,
    headers,
  });
  const payload = (await response.json()) as T & { detail?: string };
  if (!response.ok) {
    throw new Error((payload as { detail?: string }).detail ?? 'BlinkAI request failed');
  }
  return payload;
}
