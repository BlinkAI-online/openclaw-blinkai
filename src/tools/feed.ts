import { blinkRequest, type BlinkAiClientConfig } from '../client.js';

export async function listFeed(config: BlinkAiClientConfig, limit = 10) {
  return blinkRequest(config, '/feed/list', {
    method: 'POST',
    body: JSON.stringify({ limit }),
  });
}

export async function searchFeed(config: BlinkAiClientConfig, query: string, limit = 10) {
  return blinkRequest(config, '/feed/search', {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
  });
}
