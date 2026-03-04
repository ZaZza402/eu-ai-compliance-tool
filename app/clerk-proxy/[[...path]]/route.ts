/**
 * Clerk Frontend API Proxy
 * ========================
 * Proxies Clerk Frontend API requests through regumatrix.eu/clerk-proxy/
 * Connects directly to frontend-api.clerk.services with Host: clerk.regumatrix.eu
 * to bypass any DNS resolution issues inside Vercel's network.
 */

export const runtime = "nodejs";

// Connect directly to Clerk's API server, set Host header so it routes correctly
const CLERK_UPSTREAM = "https://frontend-api.clerk.services";
const CLERK_HOST = "clerk.regumatrix.eu";

async function proxyToClerk(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/clerk-proxy/, "") + url.search;
    const upstreamUrl = CLERK_UPSTREAM + path;

    const headers = new Headers();
    for (const [key, value] of req.headers.entries()) {
      const lower = key.toLowerCase();
      if (
        lower === "host" ||
        lower === "connection" ||
        lower === "transfer-encoding"
      )
        continue;
      headers.set(key, value);
    }
    // Override Host so Clerk routes to the correct instance
    headers.set("host", CLERK_HOST);

    const hasBody = !["GET", "HEAD"].includes(req.method);
    const body = hasBody ? await req.arrayBuffer() : undefined;

    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: body ? Buffer.from(body) : undefined,
    });

    const resHeaders = new Headers();
    for (const [key, value] of upstreamRes.headers.entries()) {
      const lower = key.toLowerCase();
      if (lower === "transfer-encoding" || lower === "connection") continue;
      resHeaders.set(key, value);
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("[clerk-proxy] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET(req: Request) {
  return proxyToClerk(req);
}
export async function POST(req: Request) {
  return proxyToClerk(req);
}
export async function PUT(req: Request) {
  return proxyToClerk(req);
}
export async function PATCH(req: Request) {
  return proxyToClerk(req);
}
export async function DELETE(req: Request) {
  return proxyToClerk(req);
}
export async function HEAD(req: Request) {
  return proxyToClerk(req);
}
export async function OPTIONS(req: Request) {
  return proxyToClerk(req);
}
