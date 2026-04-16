import { getContext } from '../tools/context.js';
export async function buildLiveContext(config) {
    if (config.relayAgent === false) {
        return '';
    }
    const response = await getContext(config);
    const data = response.data ?? {};
    const user = data.user ?? {};
    const agent = data.agent ?? {};
    const location = agent.lastLocation ?? null;
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
