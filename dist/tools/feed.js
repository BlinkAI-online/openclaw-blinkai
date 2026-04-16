import { blinkRequest } from '../client.js';
export async function listFeed(config, limit = 10) {
    return blinkRequest(config, '/feed/list', {
        method: 'POST',
        body: JSON.stringify({ limit }),
    });
}
export async function searchFeed(config, query, limit = 10) {
    return blinkRequest(config, '/feed/search', {
        method: 'POST',
        body: JSON.stringify({ query, limit }),
    });
}
