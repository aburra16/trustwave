# TrustWave - Music Discovery Through Trust

A decentralized music discovery application built on Nostr that replaces opaque algorithms with a transparent Web-of-Trust.

## Architecture

TrustWave implements a 5-layer stack:

1. **Distribution Layer** - RSS feeds and Podcast Index for music content
2. **Identity Layer** - Nostr protocol for public keys and social interaction
3. **Organization Layer** - Decentralized Lists (kind 9998/9999) for open playlists
4. **Curation Layer** - Web-of-Trust filtering (Depth 0 + Depth 1)
5. **Presentation Layer** - React app with audio player and V4V payments

## Features

- **Trust-Based Discovery** - See only music added by people in your trust network
- **Open Playlists** - Anyone can contribute tracks to community playlists
- **Curator Tools** - Search and add tracks with annotations
- **Web-of-Trust Filtering** - Toggle between Global and Trusted views
- **Audio Player** - Stream music directly from RSS enclosures
- **V4V Support** - Ready for Lightning zap integration

## Nostr Event Kinds

- **Kind 9998** - List Declaration (playlist header)
- **Kind 9999** - List Item (track added to playlist)
- **Kind 3** - Follow list (for WoT calculation)
- **Kind 10040** - Trusted Service Providers (NIP-85)
- **Kind 30382** - Trusted Assertions (NIP-85)

## Podcast Index Integration

The app includes Podcast Index API integration, but due to security requirements, **the API requires a backend proxy** to keep the API secret secure.

### Current State
- **Mock data** is used by default with 10 sample V4V tracks
- The Podcast Index integration code is ready and will automatically activate when you deploy the proxy
- Cloudflare Worker code is included in `/cloudflare-worker/`

### Quick Setup (Recommended)

**Step 1**: Deploy the Cloudflare Worker proxy (keeps your API secret secure):

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

**Step 2**: Configure TrustWave to use your proxy:

Create `.env` file in the TrustWave project root:

```env
VITE_PI_PROXY_URL=https://trustwave-pi-proxy.<your-subdomain>.workers.dev
```

**Step 3**: Rebuild TrustWave:

```bash
npm run build
```

That's it! The app will now use real Podcast Index data.

### Alternative Options

#### Option 1: Serverless Function
Deploy a serverless function (Cloudflare Worker, Vercel Edge Function, etc.) that:
1. Receives search queries from the browser
2. Adds Podcast Index auth headers server-side
3. Returns results to the browser

Example Cloudflare Worker:
```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    const apiTime = Math.floor(Date.now() / 1000);
    const hash = await sha1(API_KEY + API_SECRET + apiTime);

    const response = await fetch(`https://api.podcastindex.org/api/1.0/search/byterm?q=${query}`, {
      headers: {
        'X-Auth-Date': apiTime,
        'X-Auth-Key': API_KEY,
        'Authorization': hash
      }
    });

    return new Response(await response.text(), {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}
```

#### Option 2: Use a Third-Party V4V Music Directory
Instead of Podcast Index, integrate with:
- **Wavlake** - Bitcoin music platform with public API
- **Fountain.fm** - V4V podcast/music directory
- Other V4V-enabled music platforms

#### Option 3: Backend Proxy Service
Set up a simple Express/Node.js server that proxies Podcast Index requests.

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

Output will be in `/dist` ready for deployment.

## Tech Stack

- React 18 with TypeScript
- TailwindCSS with custom violet/fuchsia theme
- Nostrify for Nostr protocol
- TanStack Query for data fetching
- shadcn/ui components
- Inter Variable font

## License

Public domain (per Nostr NIP standards)
