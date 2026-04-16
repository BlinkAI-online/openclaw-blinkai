const connectPromises = new Map();
function normalizeBaseUrl(value) {
    return value.replace(/\/$/, '');
}
function buildConnectEndpoint(config) {
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
async function ensureBlinkAgentConnected(config) {
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
                const payload = (await response.json());
                if (payload.detail) {
                    detail = payload.detail;
                }
            }
            catch {
                // ignore json parse failures for non-json error responses
            }
            throw new Error(detail);
        }
    })();
    connectPromises.set(cacheKey, connectPromise);
    try {
        await connectPromise;
    }
    catch (error) {
        connectPromises.delete(cacheKey);
        throw error;
    }
}
export async function blinkRequest(config, path, init) {
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
    const payload = (await response.json());
    if (!response.ok) {
        throw new Error(payload.detail ?? 'BlinkAI request failed');
    }
    return payload;
}
