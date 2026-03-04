/**
 * Clerk Frontend API Proxy
 * ========================
 * Proxies all Clerk Frontend API requests through regumatrix.eu/clerk-proxy/...
 * so the browser never needs to resolve clerk.regumatrix.eu directly.
 *
 * This solves DNS-level blocking (Pi-hole, Firewalla, NextDNS, corporate firewalls)
 * for all users on all networks.
 *
 * Runs in Node.js runtime (not Edge) to avoid TLS handshake issues with
 * Next.js edge rewrites targeting CNAME destinations.
 */

export const runtime = "nodejs";

const CLERK_FRONTEND_API = "https://clerk.regumatrix.eu";

async function proxyToClerk(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Build the upstream URL: replace our origin with Clerk's
  const upstreamUrl =
    CLERK_FRONTEND_API +
    url.pathname.replace(/^\/clerk-proxy/, "") +
    url.search;

  // Forward all headers except host (which must match the upstream)
  const headers = new Headers(req.headers);
  headers.delete("host");

  const upstreamReq = new Request(upstreamUrl, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    // @ts-expect-error — duplex required for streaming bodies
    duplex: "half",
  });

  const upstreamRes = await fetch(upstreamReq);

  // Forward the response back, preserving headers
  const resHeaders = new Headers(upstreamRes.headers);
  // Remove hop-by-hop headers that shouldn't be forwarded
  resHeaders.delete("transfer-encoding");

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: resHeaders,
  });
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
