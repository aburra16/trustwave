# TrustWave - Music Discovery Through Trust

A decentralized music discovery application built on Nostr that replaces opaque algorithms with a transparent Web-of-Trust. Discover and curate music through collaborative playlists powered by social trust networks.

## 🎵 What is TrustWave?

TrustWave is a music discovery platform where:
- **Your network curates your music** - See tracks added by people you follow
- **Playlists are open and collaborative** - Anyone can add tracks to any playlist, creating community-driven music collections
- **Discovery is transparent** - No black-box algorithms, just visible social connections
- **Content is decentralized** - Music feeds are stored on RSS, playlist data on Nostr, all open and interoperable

## ✨ Key Features

### Music Discovery & Playback
- 🎧 **Integrated Audio Player** - Stream music directly from RSS feeds with full playback controls
- 🔍 **Smart Search** - Find music by artist, track, or genre via Podcast Index integration
- 📀 **Album Browsing** - Browse full albums and select specific tracks to add
- ⏱️ **Automatic Duration Fetching** - Track lengths displayed and cached automatically
- ⚡ **V4V Support** - Value4Value enabled tracks with Lightning payment integration ready

### Social & Trust Features
- 👥 **Web-of-Trust Filtering** - Toggle between "All" (global) and "Trusted" (your network) views
- 🌊 **Fast Trust Network** - See only content from people you follow
- 👤 **User Profiles** - See who added what tracks with follow indicators
- 📝 **Track Annotations** - Curators can add notes explaining why they added a track

### Playlist Management
- 📋 **Open Playlists** - Create public playlists that anyone can contribute to
- ➕ **Easy Track Addition** - Search, browse albums, select tracks, and add with optional annotations
- 🎨 **Rich Metadata** - Playlists support titles, descriptions, images, and tags
- 🔄 **Real-time Updates** - Playlist changes sync across the Nostr network instantly

## 🏗️ Architecture

TrustWave implements a 5-layer stack:

1. **Distribution Layer** - RSS feeds and Podcast Index for music content (music-only filtering)
2. **Identity Layer** - Nostr protocol for public keys and social interaction
3. **Organization Layer** - Decentralized Lists (NIP-51: kinds 9998/9999) for open playlists
4. **Curation Layer** - Web-of-Trust filtering (people you follow)
5. **Presentation Layer** - React app with audio player and V4V payments

## Nostr Event Kinds

- **Kind 9998** - List Declaration (playlist header)
- **Kind 9999** - List Item (track added to playlist)
- **Kind 3** - Follow list (for WoT calculation)
- **Kind 10040** - Trusted Service Providers (NIP-85)
- **Kind 30382** - Trusted Assertions (NIP-85)

## 🎵 Music Discovery with Podcast Index

TrustWave uses Podcast Index as its primary music source, with **music-only filtering** to ensure you only see music content (no podcasts, audiobooks, or other media types).

### Two-Step Track Selection

The app uses an intelligent track selection flow:

1. **Search & Browse** - Search returns music feeds/albums
2. **Select Tracks** - Click "Browse Tracks" to see all songs in an album
3. **Add to Playlist** - Choose specific tracks to add with optional annotations

This prevents accidentally adding entire albums when you only want one song!

### Setup Requirements

The Podcast Index integration requires a **Cloudflare Worker proxy** to keep API credentials secure. The worker is already configured with music-only filtering.

**Quick Deployment:**

```bash
# Navigate to your worker directory (or create it)
cd trustwave-pi-proxy

# Copy the worker code
cp ../cloudflare-worker/index.ts src/index.ts

# Set your API credentials (never commit these!)
npx wrangler secret put PODCASTINDEX_KEY
npx wrangler secret put PODCASTINDEX_SECRET

# Deploy to Cloudflare
npm run deploy
```

**Configure TrustWave:**

Create `.env` in project root:

```env
VITE_PI_PROXY_URL=https://trustwave-pi-proxy.<your-subdomain>.workers.dev
```

Then rebuild the app:

```bash
npm run build
```

See `/cloudflare-worker/README.md` for detailed setup instructions and endpoint documentation.

### Music-Only Filtering

The worker uses Podcast Index's `/search/music/byterm` endpoint to ensure only music content is returned:
- ✅ Music albums and tracks
- ✅ Music feeds with V4V support
- ❌ Podcasts, audiobooks, and other media types filtered out

### Fallback Mode

Without the proxy, the app uses mock data with 10 sample V4V tracks for testing and demonstration.

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
