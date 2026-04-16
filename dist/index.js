import { blinkRequest } from './client.js';
import { claimNextAgentCommand, completeAgentCommand, getAgentSession, readAgentCommand } from './tools/agent.js';
import { buildLiveContext } from './hooks/live-context.js';
import { handlePush } from './routes/push.js';
import { getChainStatus, getWalletSummary, prepareTransaction } from './tools/chain.js';
import { getContext, getLiveLocation } from './tools/context.js';
import { listFeed, searchFeed } from './tools/feed.js';
import { getListing, searchMarketplace } from './tools/marketplace.js';
function readEnv(name) {
    const env = typeof globalThis === 'object' && 'process' in globalThis
        ? (globalThis.process?.env ?? {})
        : {};
    return env[name] ?? null;
}
function resolvePluginConfig(api, context) {
    if (typeof api.getConfig === 'function') {
        return api.getConfig();
    }
    if (api.config && typeof api.config === 'object') {
        return api.config;
    }
    if (api.plugin?.config && typeof api.plugin.config === 'object') {
        return api.plugin.config;
    }
    if (context?.config && typeof context.config === 'object') {
        return context.config;
    }
    if (context?.plugin?.config && typeof context.plugin.config === 'object') {
        return context.plugin.config;
    }
    return {};
}
function getClientConfig(api, context) {
    const config = resolvePluginConfig(api, context);
    return {
        baseUrl: String(config.baseUrl ?? ''),
        apiToken: config.apiTokenEnv ? readEnv(String(config.apiTokenEnv)) : null,
        connectUrl: config.connectUrl ? String(config.connectUrl) : null,
        relayAgent: config.relayAgent !== false,
    };
}
export default function register(api, context) {
    api.registerTool({
        name: 'blinkai_agent_session',
        description: 'Read the current BlinkAI chat relay session for this onboarded OpenClaw agent.',
        execute: async () => getAgentSession(getClientConfig(api, context)),
    });
    api.registerTool({
        name: 'blinkai_agent_claim_next_command',
        description: 'Claim the next pending Blink user command routed to this OpenClaw agent.',
        execute: async () => claimNextAgentCommand(getClientConfig(api, context)),
    });
    api.registerTool({
        name: 'blinkai_agent_read_command',
        description: 'Read a specific Blink user command that was routed to this OpenClaw agent.',
        execute: async (args) => readAgentCommand(getClientConfig(api, context), Number(args.commandId)),
    });
    api.registerTool({
        name: 'blinkai_agent_complete_command',
        description: 'Complete a claimed Blink user command with the OpenClaw agent response.',
        execute: async (args) => completeAgentCommand(getClientConfig(api, context), Number(args.commandId), String(args.body ?? ''), (args.metadata ?? {})),
    });
    api.registerTool({
        name: 'blinkai_get_context',
        description: 'Read the user’s current BlinkAI context.',
        execute: async () => getContext(getClientConfig(api, context)),
    });
    api.registerTool({
        name: 'blinkai_get_live_location',
        description: 'Read the user’s latest BlinkAI location snapshot.',
        execute: async () => getLiveLocation(getClientConfig(api, context)),
    });
    api.registerTool({
        name: 'blinkai_feed_list',
        description: 'List BlinkAI feed posts.',
        execute: async (args) => listFeed(getClientConfig(api, context), Number(args.limit ?? 10)),
    });
    api.registerTool({
        name: 'blinkai_feed_search',
        description: 'Search BlinkAI feed posts.',
        execute: async (args) => searchFeed(getClientConfig(api, context), String(args.query ?? ''), Number(args.limit ?? 10)),
    });
    api.registerTool({
        name: 'blinkai_marketplace_search',
        description: 'Search BlinkAI marketplace listings.',
        execute: async (args) => searchMarketplace(getClientConfig(api, context), String(args.query ?? ''), Number(args.limit ?? 10)),
    });
    api.registerTool({
        name: 'blinkai_listing_get',
        description: 'Get a BlinkAI marketplace listing.',
        execute: async (args) => getListing(getClientConfig(api, context), Number(args.listingId)),
    });
    api.registerTool({
        name: 'blinkai_wallet_summary',
        description: 'Read the Blink wallet summary.',
        execute: async () => getWalletSummary(getClientConfig(api, context)),
    });
    api.registerTool({
        name: 'blinkai_chain_status',
        description: 'Read BlinkChain status.',
        execute: async () => getChainStatus(getClientConfig(api, context)),
    });
    api.registerTool({
        name: 'blinkai_tx_prepare',
        description: 'Prepare a BlinkChain transaction with Blink confirmation.',
        execute: async (args) => prepareTransaction(getClientConfig(api, context), String(args.action ?? 'unknown'), args.payload ?? {}),
    });
    api.registerTool({
        name: 'blinkai_contract_read',
        description: 'Perform a Blink contract read through BlinkAI.',
        execute: async (args) => blinkRequest(getClientConfig(api, context), '/chain/contract/read', { method: 'POST', body: JSON.stringify({ action: 'contract_read', payload: args }) }),
    });
    api.registerTool({
        name: 'blinkai_post_create',
        description: 'Prepare a Blink feed post creation through BlinkAI.',
        execute: async (args) => blinkRequest(getClientConfig(api, context), '/chain/tx/prepare', { method: 'POST', body: JSON.stringify({ action: 'feed_post_create', payload: args }) }),
    });
    api.registerTool({
        name: 'blinkai_listing_create',
        description: 'Prepare a Blink marketplace listing creation through BlinkAI.',
        execute: async (args) => blinkRequest(getClientConfig(api, context), '/chain/tx/prepare', { method: 'POST', body: JSON.stringify({ action: 'marketplace_listing_create', payload: args }) }),
    });
    api.registerTool({
        name: 'blinkai_tx_submit',
        description: 'Submit a prepared Blink transaction after confirmation.',
        execute: async (args) => blinkRequest(getClientConfig(api, context), '/chain/tx/submit', { method: 'POST', body: JSON.stringify({ action: 'tx_submit', payload: args }) }),
    });
    api.registerHook('before_prompt_build', async () => ({
        prependContext: await buildLiveContext(getClientConfig(api, context)),
    }));
    api.registerHttpRoute({ method: 'POST', path: '/plugins/blinkai/push' }, handlePush);
}
