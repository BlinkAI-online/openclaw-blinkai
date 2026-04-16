# before_prompt_build

This hook injects concise live BlinkAI context before each prompt build.

It is intended to give the OpenClaw agent just enough current Blink state to operate safely:

- active Blink user identity
- active wallet address
- current agent mode
- last known location snapshot
- current Blink screen context

The hook must stay concise and prompt-safe.

Rules:

- Do not inject full chat history.
- Do not inject raw GPS history.
- Prefer short, structured state over verbose prose.
- Use BlinkAI API data as the source of truth.
- If live context is unavailable, fail soft and continue without it.
