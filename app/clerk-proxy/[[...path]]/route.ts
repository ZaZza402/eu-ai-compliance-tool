/**
 * Clerk Frontend API Proxy
 * ========================
 * Proxies all Clerk Frontend API requests through regumatrix.eu/clerk-proxy/...
 * so the browser never needs to resolve clerk.regumatrix.eu directly.
 */

export const runtime = "nodejs";

const CLERK_FRONTEND_API = "https://clerk.regumatrix.eu";

async function proxyToClerk(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/clerk-proxy/, "") + url.search;
    const upstreamUrl = CLERK_FRONTEND_API + path;

    const headers = new Headers();
    // Only forward safe headers
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
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }
}

export async function GET(req: Request) { return proxyToClerk(req); }
export async function POST(req: Request) { return proxyToClerk(req); }
export async function PUT(req: Request) { return proxyToClerk(req); }
export async function PATCH(req: Request) { return proxyToClerk(req); }
export async function DELETE(req: Request) { return proxyToClerk(req); }
export async function HEAD(req: Request) { return proxyToClerk(req); }
export async function OPTIONS(req: Request) { return proxyToClerk(req); }

