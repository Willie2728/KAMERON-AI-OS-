import http from 'node:http';
import { KameronRuntime } from './runtime.js';
import { JsonCheckpointStorage, StorageFabric } from './storage.js';

const port = Number(process.env.PORT || 8081);
const host = process.env.HOST || '127.0.0.1';
const adminToken = process.env.KAMERON_ADMIN_TOKEN || 'dev-admin-change-me';
const requireSwarmer = process.env.KAMERON_REQUIRE_SWARMER === 'true';
const minimumTrust = Number(process.env.KAMERON_MIN_TRUST_SCORE || 70);

if (process.env.NODE_ENV === 'production' && adminToken.startsWith('dev-')) {
  throw new Error('Production requires KAMERON_ADMIN_TOKEN');
}

const storage = new StorageFabric(new JsonCheckpointStorage(process.env.KAMERON_CHECKPOINT_DIR));
const runtime = new KameronRuntime({
  storage,
  policy: { minimum_trust_score: minimumTrust, require_swarmer: requireSwarmer }
});

const securityHeaders = {
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer'
};

const json = (res, status, data) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...securityHeaders });
  res.end(JSON.stringify(data));
};

const readBody = async req => {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error('Body too large');
  }
  return body ? JSON.parse(body) : {};
};

const authorized = req => (req.headers.authorization || '') === `Bearer ${adminToken}`;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, {
        status: 'ok',
        service: 'kameron-ai-os-runtime',
        runtime_version: runtime.runtimeVersion,
        policy: runtime.policy,
        time: new Date().toISOString()
      });
    }
    if (!url.pathname.startsWith('/api/v1/')) return json(res, 404, { error: 'Not found' });
    if (!authorized(req)) return json(res, 401, { error: 'Admin bearer token required' });

    if (req.method === 'GET' && url.pathname === '/api/v1/checkpoints') {
      return json(res, 200, storage.list());
    }
    if (req.method === 'POST' && url.pathname === '/api/v1/jobs') {
      return json(res, 201, runtime.registerJob(await readBody(req)));
    }
    const checkpointMatch = url.pathname.match(/^\/api\/v1\/jobs\/([^/]+)\/checkpoint$/);
    if (req.method === 'POST' && checkpointMatch) {
      return json(res, 201, runtime.checkpoint(checkpointMatch[1], await readBody(req)));
    }
    const interruptMatch = url.pathname.match(/^\/api\/v1\/jobs\/([^/]+)\/interrupt$/);
    if (req.method === 'POST' && interruptMatch) {
      const input = await readBody(req);
      return json(res, 200, runtime.interrupt(interruptMatch[1], input.reason));
    }
    const evaluateMatch = url.pathname.match(/^\/api\/v1\/checkpoints\/([^/]+)\/evaluate$/);
    if (req.method === 'POST' && evaluateMatch) {
      return json(res, 200, runtime.evaluate(evaluateMatch[1], { ...runtime.policy, ...(await readBody(req)) }));
    }
    const resumeMatch = url.pathname.match(/^\/api\/v1\/checkpoints\/([^/]+)\/resume$/);
    if (req.method === 'POST' && resumeMatch) {
      return json(res, 202, runtime.resume(resumeMatch[1]));
    }
    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    return json(res, error instanceof SyntaxError ? 400 : 500, { error: error.message, decision: error.decision });
  }
});

server.listen(port, host, () => console.log(`KAMERON AI OS Runtime listening on http://${host}:${port}`));
