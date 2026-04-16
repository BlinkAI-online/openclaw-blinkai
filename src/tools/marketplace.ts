import { blinkRequest, type BlinkAiClientConfig } from '../client.js';

export async function searchMarketplace(config: BlinkAiClientConfig, query: string, limit = 10) {
  return blinkRequest(config, '/marketplace/search', {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
  });
}

export async function getListing(config: BlinkAiClientConfig, listingId: number) {
  return blinkRequest(config, `/marketplace/listings/${listingId}`);
}
