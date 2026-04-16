export async function handlePush(request: Request) {
  const payload = await request.json().catch(() => ({}));
  return new Response(JSON.stringify({ ok: true, received: payload }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
