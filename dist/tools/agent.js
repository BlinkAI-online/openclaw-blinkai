import { blinkRequest } from '../client.js';
export async function getAgentSession(config) {
    return blinkRequest(config, '/agent/session');
}
export async function claimNextAgentCommand(config) {
    return blinkRequest(config, '/agent/commands/next', {
        method: 'POST',
        body: JSON.stringify({}),
    });
}
export async function readAgentCommand(config, commandId) {
    return blinkRequest(config, `/agent/commands/${commandId}`);
}
export async function completeAgentCommand(config, commandId, body, metadata = {}) {
    return blinkRequest(config, `/agent/commands/${commandId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ body, metadata }),
    });
}
