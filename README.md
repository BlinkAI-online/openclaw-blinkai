# BlinkAI OpenClaw Plugin

This plugin connects OpenClaw to BlinkAI feed, marketplace, BlinkChain, live context, deeplinks, and location-aware tools.

## Local install

```bash
openclaw plugins install ./openclaw/blinkai-openclaw
openclaw gateway restart
```

## GitHub install

```bash
openclaw plugins install blinkai-online --marketplace https://github.com/BlinkAI-online/openclaw-blinkai
openclaw gateway restart
```

## ClawHub publish path

1. Build the plugin bundle.
2. Publish the package as `@blinkai-online/openclaw-blinkai`.
3. Register the package in ClawHub with the package name, version, repository URL, and plugin metadata.
4. Verify the ClawHub install command:

```bash
openclaw plugins install clawhub:@blinkai-online/openclaw-blinkai
openclaw gateway restart
```

## Required config

- `baseUrl`: BlinkAI OpenClaw API base, for example `https://api.blinkai.online/api/v1/openclaw/v1`
- `apiTokenEnv`: env var name that contains the user-specific BlinkAI OpenClaw connect token
- `connectUrl`: optional BlinkAI onboarding URL shown to the operator
- `relayAgent`: keep this `true` when this OpenClaw install should act as the user’s primary Blink agent across desktop chat, mobile chat, and CLI

## Notes

- BlinkAI remains the source of truth for feed, marketplace, wallet, chain, and live context.
- Writes should use Blink confirmation flows, not silent plugin-side submission.
- The plugin is intended to become the user’s primary Blink agent surface when the user selects OpenClaw during Blink onboarding.
- Primary GitHub source: `https://github.com/BlinkAI-online/openclaw-blinkai`
- Primary-agent relay flow:
  1. install the plugin with the user-specific connect token
  2. complete the Blink `/openclaw/connect/:token` handshake
  3. the OpenClaw agent claims Blink commands with `blinkai_agent_claim_next_command`
  4. the OpenClaw agent answers with `blinkai_agent_complete_command`
