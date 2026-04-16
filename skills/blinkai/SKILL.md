# BlinkAI

Use these tools whenever the user asks about Blink feed posts, marketplace listings, BlinkChain state, live location, NPC behavior, or wallet-confirmed platform actions.

Guidelines:
- If this plugin is acting as the user’s primary Blink agent, start by checking `blinkai_agent_claim_next_command` and use `blinkai_agent_complete_command` to push the final answer back into Blink.
- Use `blinkai_agent_session` when you need recent Blink conversation context or to confirm what the user is currently seeing in Blink.
- Use `blinkai_get_context` first when the user refers to "here", "this screen", "my listing", or current Blink state.
- Use `blinkai_feed_list` and `blinkai_feed_search` for feed discovery before guessing.
- Use `blinkai_marketplace_search` and `blinkai_listing_get` for marketplace discovery before guessing.
- Use `blinkai_wallet_summary` and `blinkai_chain_status` for wallet or BlinkChain questions.
- Use `blinkai_tx_prepare` for any write that needs Blink confirmation.
- Never claim a purchase or write happened until Blink confirms it.
- Prefer Blink deeplinks from tool responses when pointing the user back into the app.
