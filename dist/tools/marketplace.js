import { blinkRequest } from '../client.js';
export async function searchMarketplace(config, query, limit = 10) {
    return blinkRequest(config, '/marketplace/search', {
        method: 'POST',
        body: JSON.stringify({ query, limit }),
    });
}
export async function getListing(config, listingId) {
    return blinkRequest(config, `/marketplace/listings/${listingId}`);
}
