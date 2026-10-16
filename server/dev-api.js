// Run the same server handlers in the local Vite preview; secrets stay in Node.
export function growthApiPlugin() {
  return { name: 'twenty3-growth-api', configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost');
      const endpoints = { '/api/growth': () => import('../api/growth.js'), '/api/events': () => import('../api/events.js'), '/api/growth-cron': () => import('../api/growth-cron.js') };
      const endpoint = endpoints[url.pathname];
      if (!endpoint) return next();
      res.status = status => { res.statusCode = status; return res; };
      res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return res; };
      try {
        req.query = Object.fromEntries(url.searchParams);
        let content = '';
        for await (const chunk of req) { content += chunk; if (content.length > 24000) { res.status(413).json({ error: 'Request too large.' }); return; } }
        req.body = content;
        const module = await endpoint();
        await module.default(req, res);
      } catch { if (!res.writableEnded) res.status(500).json({ error: 'Local API unavailable. Check server configuration and restart the preview.' }); }
    });
  } };
}
