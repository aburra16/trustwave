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
    // 1. CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Auth Check
    const apiKey = (env.PODCASTINDEX_KEY || "").trim();
    const apiSecret = (env.PODCASTINDEX_SECRET || "").trim();
    if (!apiKey || !apiSecret) {
      return new Response(JSON.stringify({ error: "Keys Missing" }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // 3. Generate Headers (The Handshake)
    const apiHeaderTime = Math.floor(Date.now() / 1000);
    const data4Hash = apiKey + apiSecret + apiHeaderTime;
    const msgBuffer = new TextEncoder().encode(data4Hash);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const piHeaders = {
      "User-Agent": "TrustWave/1.0",
      "X-Auth-Key": apiKey,
      "X-Auth-Date": apiHeaderTime.toString(),
      "Authorization": hashHex,
    };

    // 4. Routing Logic
    const url = new URL(request.url);
    const path = url.pathname;
    const params = url.searchParams;
    
    // Base API URL
    const BASE_API = "https://api.podcastindex.org/api/1.0";
    let targetUrl = "";

    // SEARCH endpoint - supports music filtering
    if (path === "/search" || path === "/") {
      const q = params.get("q");
      if (!q && path === "/search") {
        return new Response(JSON.stringify({ error: "Missing 'q' param" }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }
      
      const medium = params.get("medium");
      const max = params.get("max") || "20";

      // Use the specific "Music" endpoint if medium is music
      if (medium === "music") {
        targetUrl = `${BASE_API}/search/music/byterm?q=${encodeURIComponent(q || "")}&max=${max}`;
      } else {
        targetUrl = `${BASE_API}/search/byterm?q=${encodeURIComponent(q || "")}&max=${max}`;
      }
    
    // RECENT endpoint - for featured/trending content
    } else if (path === "/recent") {
      const medium = params.get("medium");
      const max = params.get("max") || "20";
      
      // For music, use the music search endpoint with a broad query
      // This gives us music feeds similar to a "trending" or "featured" list
      if (medium === "music") {
        targetUrl = `${BASE_API}/search/music/byterm?q=music&max=${max}`;
      } else {
        // For other media types, use recent feeds
        targetUrl = `${BASE_API}/recent/feeds?max=${max}`;
      }

    // EPISODES BY FEED ID endpoint
    } else if (path === "/episodes/byfeedid") {
      const id = params.get("id");
      const max = params.get("max") || "10";
      
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing 'id' param" }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }
      
      targetUrl = `${BASE_API}/episodes/byfeedid?id=${id}&max=${max}`;

    // EPISODE BY ID endpoint
    } else if (path === "/episodes/byid") {
      const id = params.get("id");
      
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing 'id' param" }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }
      
      targetUrl = `${BASE_API}/episodes/byid?id=${id}`;

    } else {
      return new Response(JSON.stringify({ error: "Endpoint not found" }), { 
        status: 404, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 5. Execute Request
    try {
      const response = await fetch(targetUrl, { headers: piHeaders });
      const data = await response.text();
      return new Response(data, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.status
      });
    } catch (err) {
      return new Response(JSON.stringify({ 
        error: "Proxy Fetch Failed", 
        details: err instanceof Error ? err.message : String(err)
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  },
};
