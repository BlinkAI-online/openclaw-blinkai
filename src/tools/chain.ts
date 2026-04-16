import { blinkRequest, type BlinkAiClientConfig } from '../client.js';

export async function getWalletSummary(config: BlinkAiClientConfig) {
  return blinkRequest(config, '/wallet/summary');
}

export async function getChainStatus(config: BlinkAiClientConfig) {
  return blinkRequest(config, '/chain/status');
}

export async function prepareTransaction(config: BlinkAiClientConfig, action: string, payload: Record<string, unknown>) {
  return blinkRequest(config, '/chain/tx/prepare', {
    method: 'POST',
    body: JSON.stringify({ action, payload }),
  });
}
