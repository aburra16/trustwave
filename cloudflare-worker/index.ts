/**
 * Cloudflare Worker proxy for Podcast Index API
 * 
 * This Worker handles authenticated requests to the Podcast Index API,
 * keeping the API secret secure and solving CORS issues.
 * 
 * Deploy instructions:
 * 1. npm create cloudflare@latest trustwave-pi-proxy
 * 2. cd trustwave-pi-proxy
 * 3. Copy this file to src/index.ts
 * 4. npx wrangler secret put PODCASTINDEX_KEY
 * 5. npx wrangler secret put PODCASTINDEX_SECRET
 * 6. npm run deploy
 */

export default {
  async fetch(request: Request, env: { PODCASTINDEX_KEY: string; PODCASTINDEX_SECRET: string }) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    // Endpoint: /search?q=term&max=20
    if (url.pathname === "/search") {
      const q = url.searchParams.get("q") ?? "";
      const max = url.searchParams.get("max") ?? "20";
      
      if (!q.trim()) {
        return json({ error: "Missing q parameter" }, 400, request);
      }

      const apiTime = Math.floor(Date.now() / 1000).toString();
      const authHash = await sha1Hex(env.PODCASTINDEX_KEY + env.PODCASTINDEX_SECRET + apiTime);

      const upstream = new URL("https://api.podcastindex.org/api/1.0/search/byterm");
      upstream.searchParams.set("q", q);
      upstream.searchParams.set("max", max);

      const resp = await fetch(upstream.toString(), {
        headers: {
          "X-Auth-Date": apiTime,
          "X-Auth-Key": env.PODCASTINDEX_KEY,
          "Authorization": authHash,
          "User-Agent": "trustwave-proxy/1.0",
        },
      });

      const text = await resp.text();
      return new Response(text, {
        status: resp.status,
        headers: {
          "Content-Type": resp.headers.get("Content-Type") ?? "application/json",
          ...corsHeaders(request),
        },
      });
    }

    // Endpoint: /recent?max=20
    if (url.pathname === "/recent") {
      const max = url.searchParams.get("max") ?? "20";

      const apiTime = Math.floor(Date.now() / 1000).toString();
      const authHash = await sha1Hex(env.PODCASTINDEX_KEY + env.PODCASTINDEX_SECRET + apiTime);

      const upstream = new URL("https://api.podcastindex.org/api/1.0/recent/episodes");
      upstream.searchParams.set("max", max);
      upstream.searchParams.set("lang", "en");

      const resp = await fetch(upstream.toString(), {
        headers: {
          "X-Auth-Date": apiTime,
          "X-Auth-Key": env.PODCASTINDEX_KEY,
          "Authorization": authHash,
          "User-Agent": "trustwave-proxy/1.0",
        },
      });

      const text = await resp.text();
      return new Response(text, {
        status: resp.status,
        headers: {
          "Content-Type": resp.headers.get("Content-Type") ?? "application/json",
          ...corsHeaders(request),
        },
      });
    }

    // Endpoint: /episodes/byfeedid?id=123&max=10
    if (url.pathname === "/episodes/byfeedid") {
      const feedId = url.searchParams.get("id") ?? "";
      const max = url.searchParams.get("max") ?? "10";
      
      if (!feedId) {
        return json({ error: "Missing id parameter" }, 400, request);
      }

      const apiTime = Math.floor(Date.now() / 1000).toString();
      const authHash = await sha1Hex(env.PODCASTINDEX_KEY + env.PODCASTINDEX_SECRET + apiTime);

      const upstream = new URL("https://api.podcastindex.org/api/1.0/episodes/byfeedid");
      upstream.searchParams.set("id", feedId);
      upstream.searchParams.set("max", max);

      const resp = await fetch(upstream.toString(), {
        headers: {
          "X-Auth-Date": apiTime,
          "X-Auth-Key": env.PODCASTINDEX_KEY,
          "Authorization": authHash,
          "User-Agent": "trustwave-proxy/1.0",
        },
      });

      const text = await resp.text();
      return new Response(text, {
        status: resp.status,
        headers: {
          "Content-Type": resp.headers.get("Content-Type") ?? "application/json",
          ...corsHeaders(request),
        },
      });
    }

    // Endpoint: /episodes/byid?id=123
    if (url.pathname === "/episodes/byid") {
      const episodeId = url.searchParams.get("id") ?? "";
      
      if (!episodeId) {
        return json({ error: "Missing id parameter" }, 400, request);
      }

      const apiTime = Math.floor(Date.now() / 1000).toString();
      const authHash = await sha1Hex(env.PODCASTINDEX_KEY + env.PODCASTINDEX_SECRET + apiTime);

      const upstream = new URL("https://api.podcastindex.org/api/1.0/episodes/byid");
      upstream.searchParams.set("id", episodeId);

      const resp = await fetch(upstream.toString(), {
        headers: {
          "X-Auth-Date": apiTime,
          "X-Auth-Key": env.PODCASTINDEX_KEY,
          "Authorization": authHash,
          "User-Agent": "trustwave-proxy/1.0",
        },
      });

      const text = await resp.text();
      return new Response(text, {
        status: resp.status,
        headers: {
          "Content-Type": resp.headers.get("Content-Type") ?? "application/json",
          ...corsHeaders(request),
        },
      });
    }

    return json({ error: "Not found" }, 404, request);
  },
};

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "*";
  // In production, replace "*" with your exact site origin(s)
  // e.g., "https://trustwave.yourdomain.com"
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(obj: unknown, status: number, request: Request) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}

async function sha1Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hashBuf = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(hashBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
