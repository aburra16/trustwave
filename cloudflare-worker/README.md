# TrustWave Podcast Index Proxy - Cloudflare Worker

This Cloudflare Worker acts as a secure proxy to the Podcast Index API, handling authentication and CORS while keeping API credentials secure.

## Recent Updates

**Music Filtering Added:** The worker now supports filtering by content type using the `medium` parameter. This allows TrustWave to show only music content and filter out podcasts, audiobooks, and other content types.

## Redeploying the Worker

If you've already deployed the worker and need to update it with the new music filtering feature:

### Option 1: Update Existing Worker

```bash
# Navigate to your worker directory
cd trustwave-pi-proxy

# Copy the updated worker code
cp ../cloudflare-worker/index.ts src/index.ts

# Deploy the update
npm run deploy
```

### Option 2: Fresh Deployment

If you need to redeploy from scratch:

```bash
# Create the Worker project
npm create cloudflare@latest trustwave-pi-proxy

# Choose "Hello World Worker" when prompted
cd trustwave-pi-proxy
npm install

# Copy the Worker code
cp ../cloudflare-worker/index.ts src/index.ts

# Add your secrets (NEVER commit these)
npx wrangler secret put PODCASTINDEX_KEY
# Enter: QR3MNNMGKTRHXAD9NKBL

npx wrangler secret put PODCASTINDEX_SECRET
# Enter: #$LTq8HngFFLZ8bRMqU^wSukj5E6tEPe$RKbsaRR

# Deploy
npm run deploy
```

## API Endpoints

The worker exposes the following endpoints:

### `/search` - Search for content
**Parameters:**
- `q` (required) - Search query
- `max` (optional) - Maximum results (default: 20)
- `medium` (optional) - Filter by content type: `music`, `podcast`, `video`, `film`, `audiobook`, `newsletter`, `blog`

**Example:**
```
GET /search?q=bitcoin&medium=music&max=60
```

### `/recent` - Get recent episodes
**Parameters:**
- `max` (optional) - Maximum results (default: 20)
- `medium` (optional) - Filter by content type (same values as above)

**Example:**
```
GET /recent?medium=music&max=20
```

### `/episodes/byfeedid` - Get episodes for a specific feed
**Parameters:**
- `id` (required) - Feed ID
- `max` (optional) - Maximum results (default: 10)

### `/episodes/byid` - Get a specific episode
**Parameters:**
- `id` (required) - Episode ID

## Music Filtering

TrustWave is configured to only show music content by default. The app adds `medium=music` to all search and recent queries to filter out podcasts and other content types.

This ensures users only see music feeds and episodes, making the app focused on music discovery rather than general podcast discovery.

## Environment Variables

The worker requires two secrets (set via `wrangler secret put`):

- `PODCASTINDEX_KEY` - Your Podcast Index API key
- `PODCASTINDEX_SECRET` - Your Podcast Index API secret

These are already configured for the TrustWave deployment. **Do not commit these values to git.**

## CORS Configuration

The worker is currently configured to allow all origins (`*`). For production, you should restrict this to your specific domain:

```typescript
function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "*";
  // Replace "*" with your exact site origin(s)
  // e.g., "https://trustwave.yourdomain.com"
  return {
    "Access-Control-Allow-Origin": origin,
    // ...
  };
}
```

## Deployment URL

After deployment, your worker will be available at:
```
https://trustwave-pi-proxy.<your-subdomain>.workers.dev
```

Make sure to update the `VITE_PI_PROXY_URL` environment variable in the TrustWave app to point to this URL.
