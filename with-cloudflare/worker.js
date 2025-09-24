export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { method } = request;

    // Config
    const VIDEO_COUNT = 2; // Change for more videos
    const KV = env.VOTES_KV;

    // Helper JSON response
    function json(data, status = 200) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response('', {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // GET /votes: returns the votes for each video
    if (method === 'GET' && url.pathname === '/votes') {
      const votes = [];
      for (let i = 1; i <= VIDEO_COUNT; i++) {
        const count = await KV.get(`video:${i}`);
        votes.push(Number(count) || 0);
      }
      return json({ votes });
    }

    // POST /vote: registers a vote if the token has not voted before
    if (method === 'POST' && url.pathname === '/vote') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400);
      }
      const { video, token } = body;
      if (!video || !token || video < 1 || video > VIDEO_COUNT) {
        return json({ error: 'Invalid vote' }, 400);
      }
      // Checks if the user has already voted
      const userKey = `user:${token}`;
      const alreadyVoted = await KV.get(userKey);
      if (alreadyVoted) {
        return json({ error: 'Already voted' }, 403);
      }
      // Increments the vote and marks the token as used
      await KV.put(userKey, '1');
      const videoKey = `video:${video}`;
      const count = Number(await KV.get(videoKey)) || 0;
      await KV.put(videoKey, String(count + 1));
      return json({ success: true });
    }

    // 404
    return json({ error: 'Not found' }, 404);
  },
};

