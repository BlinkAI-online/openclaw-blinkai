import { blinkRequest } from '../client.js';
export async function getWalletSummary(config) {
    return blinkRequest(config, '/wallet/summary');
}
export async function getChainStatus(config) {
    return blinkRequest(config, '/chain/status');
}
export async function prepareTransaction(config, action, payload) {
    return blinkRequest(config, '/chain/tx/prepare', {
        method: 'POST',
        body: JSON.stringify({ action, payload }),
    });
}
