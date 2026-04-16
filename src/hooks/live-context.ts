import { getContext } from '../tools/context.js';
import type { BlinkAiClientConfig } from '../client.js';

export async function buildLiveContext(config: BlinkAiClientConfig): Promise<string> {
  if (config.relayAgent === false) {
    return '';
  }
  const response = await getContext(config);
  const data = (response as { data?: Record<string, unknown> }).data ?? {};
  const user = (data.user as Record<string, unknown> | undefined) ?? {};
  const agent = (data.agent as Record<string, unknown> | undefined) ?? {};
  const location = (agent.lastLocation as Record<string, unknown> | undefined) ?? null;
  const screen = String(data.screen ?? 'blink');
  const username = String(user.username ?? 'unknown');
  const walletAddress = user.walletAddress ? String(user.walletAddress) : 'none';
  const agentMode = user.agentMode ? String(user.agentMode) : 'cloud';
  const locationText = location
    ? `${String(location.latitude)}, ${String(location.longitude)} (accuracy ${String(location.accuracyMeters ?? 'unknown')}m)`
    : 'unavailable';
  return [
    'BlinkAI live context:',
    `- screen: ${screen}`,
    `- user: @${username}`,
    `- wallet: ${walletAddress}`,
    `- agent mode: ${agentMode}`,
    `- location: ${locationText}`,
  ].join('\n');
}
