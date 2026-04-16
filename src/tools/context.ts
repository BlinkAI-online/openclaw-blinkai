import { blinkRequest, type BlinkAiClientConfig } from '../client.js';

export async function getContext(config: BlinkAiClientConfig) {
  return blinkRequest(config, '/context/current');
}

export async function getLiveLocation(config: BlinkAiClientConfig) {
  return blinkRequest(config, '/location/latest');
}
