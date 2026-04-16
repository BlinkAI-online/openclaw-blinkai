import { blinkRequest, type BlinkAiClientConfig } from './client.js';
import { claimNextAgentCommand, completeAgentCommand, getAgentSession, readAgentCommand } from './tools/agent.js';
import { buildLiveContext } from './hooks/live-context.js';
import { handlePush } from './routes/push.js';
import { getChainStatus, getWalletSummary, prepareTransaction } from './tools/chain.js';
import { getContext, getLiveLocation } from './tools/context.js';
import { listFeed, searchFeed } from './tools/feed.js';
import { getListing, searchMarketplace } from './tools/marketplace.js';

type OpenClawApi = {
  registerTool: (definition: { name: string; description: string }, handler: (args: Record<string, unknown>) => Promise<unknown>) => void;
  registerHook: (name: string, handler: () => Promise<{ prependContext?: string }>) => void;
  registerHttpRoute: (definition: { method: string; path: string }, handler: (request: Request) => Promise<Response>) => void;
  getConfig: () => Record<string, unknown>;
};

function readEnv(name: string): string | null {
  const env =
    typeof globalThis === 'object' && 'process' in globalThis
      ? ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {})
      : {};
  return env[name] ?? null;
}

function getClientConfig(api: OpenClawApi): BlinkAiClientConfig {
  const config = api.getConfig();
  return {
    baseUrl: String(config.baseUrl ?? ''),
    apiToken: config.apiTokenEnv ? readEnv(String(config.apiTokenEnv)) : null,
    connectUrl: config.connectUrl ? String(config.connectUrl) : null,
    relayAgent: config.relayAgent !== false,
  };
}

export default function register(api: OpenClawApi) {
  api.registerTool({ name: 'blinkai_agent_session', description: 'Read the current BlinkAI chat relay session for this onboarded OpenClaw agent.' }, async () => getAgentSession(getClientConfig(api)));
  api.registerTool({ name: 'blinkai_agent_claim_next_command', description: 'Claim the next pending Blink user command routed to this OpenClaw agent.' }, async () => claimNextAgentCommand(getClientConfig(api)));
  api.registerTool({ name: 'blinkai_agent_read_command', description: 'Read a specific Blink user command that was routed to this OpenClaw agent.' }, async (args) => readAgentCommand(getClientConfig(api), Number(args.commandId)));
  api.registerTool({ name: 'blinkai_agent_complete_command', description: 'Complete a claimed Blink user command with the OpenClaw agent response.' }, async (args) =>
    completeAgentCommand(
      getClientConfig(api),
      Number(args.commandId),
      String(args.body ?? ''),
      ((args.metadata as Record<string, unknown> | undefined) ?? {}),
    ));
  api.registerTool({ name: 'blinkai_get_context', description: 'Read the user’s current BlinkAI context.' }, async () => getContext(getClientConfig(api)));
  api.registerTool({ name: 'blinkai_get_live_location', description: 'Read the user’s latest BlinkAI location snapshot.' }, async () => getLiveLocation(getClientConfig(api)));
  api.registerTool({ name: 'blinkai_feed_list', description: 'List BlinkAI feed posts.' }, async (args) => listFeed(getClientConfig(api), Number(args.limit ?? 10)));
  api.registerTool({ name: 'blinkai_feed_search', description: 'Search BlinkAI feed posts.' }, async (args) => searchFeed(getClientConfig(api), String(args.query ?? ''), Number(args.limit ?? 10)));
  api.registerTool({ name: 'blinkai_marketplace_search', description: 'Search BlinkAI marketplace listings.' }, async (args) => searchMarketplace(getClientConfig(api), String(args.query ?? ''), Number(args.limit ?? 10)));
  api.registerTool({ name: 'blinkai_listing_get', description: 'Get a BlinkAI marketplace listing.' }, async (args) => getListing(getClientConfig(api), Number(args.listingId)));
  api.registerTool({ name: 'blinkai_wallet_summary', description: 'Read the Blink wallet summary.' }, async () => getWalletSummary(getClientConfig(api)));
  api.registerTool({ name: 'blinkai_chain_status', description: 'Read BlinkChain status.' }, async () => getChainStatus(getClientConfig(api)));
  api.registerTool({ name: 'blinkai_tx_prepare', description: 'Prepare a BlinkChain transaction with Blink confirmation.' }, async (args) =>
    prepareTransaction(getClientConfig(api), String(args.action ?? 'unknown'), (args.payload as Record<string, unknown>) ?? {}));
  api.registerTool({ name: 'blinkai_contract_read', description: 'Perform a Blink contract read through BlinkAI.' }, async (args) =>
    blinkRequest(getClientConfig(api), '/chain/contract/read', { method: 'POST', body: JSON.stringify({ action: 'contract_read', payload: args }) }));
  api.registerTool({ name: 'blinkai_post_create', description: 'Prepare a Blink feed post creation through BlinkAI.' }, async (args) =>
    blinkRequest(getClientConfig(api), '/chain/tx/prepare', { method: 'POST', body: JSON.stringify({ action: 'feed_post_create', payload: args }) }));
  api.registerTool({ name: 'blinkai_listing_create', description: 'Prepare a Blink marketplace listing creation through BlinkAI.' }, async (args) =>
    blinkRequest(getClientConfig(api), '/chain/tx/prepare', { method: 'POST', body: JSON.stringify({ action: 'marketplace_listing_create', payload: args }) }));
  api.registerTool({ name: 'blinkai_tx_submit', description: 'Submit a prepared Blink transaction after confirmation.' }, async (args) =>
    blinkRequest(getClientConfig(api), '/chain/tx/submit', { method: 'POST', body: JSON.stringify({ action: 'tx_submit', payload: args }) }));

  api.registerHook('before_prompt_build', async () => ({
    prependContext: await buildLiveContext(getClientConfig(api)),
  }));

  api.registerHttpRoute({ method: 'POST', path: '/plugins/blinkai/push' }, handlePush);
}
