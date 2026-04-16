import { blinkRequest, type BlinkAiClientConfig } from '../client.js';

export async function getAgentSession(config: BlinkAiClientConfig) {
  return blinkRequest(config, '/agent/session');
}

export async function claimNextAgentCommand(config: BlinkAiClientConfig) {
  return blinkRequest(config, '/agent/commands/next', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function readAgentCommand(config: BlinkAiClientConfig, commandId: number) {
  return blinkRequest(config, `/agent/commands/${commandId}`);
}

export async function completeAgentCommand(
  config: BlinkAiClientConfig,
  commandId: number,
  body: string,
  metadata: Record<string, unknown> = {},
) {
  return blinkRequest(config, `/agent/commands/${commandId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ body, metadata }),
  });
}
