# TrustWave Custom NIP Documentation

This document describes the Nostr event kinds used by TrustWave, a decentralized music curation application.

## Overview

TrustWave uses a combination of standard NIPs and custom event kinds to enable trust-based music discovery:

- **Decentralized Lists NIP** (kinds 9998, 9999) - For open, community-contributed playlists
- **NIP-85 Trusted Assertions** (kinds 10040, 30382) - For curator reputation and trust
- **NIP-02** (kind 3) - For follow lists used in Web-of-Trust calculations

## Event Kinds Used

### Kind 9998: List Declaration (Playlist Header)

Declares a new music playlist/list that anyone can contribute to.

```json
{
  "kind": 9998,
  "tags": [
    ["names", "playlist", "playlists"],
    ["title", "Bitcoin Rap"],
    ["description", "The best Bitcoin-themed rap tracks"],
    ["image", "https://example.com/playlist-cover.jpg"],
    ["t", "bitcoin"],
    ["t", "rap"],
    ["t", "hip-hop"],
    ["required", "r"],
    ["recommended", "title", "artist", "annotation"]
  ],
  "content": "",
  "id": "<list_id>"
}
```

**Tags:**
- `names`: Required. Singular and plural form of the list type
- `title`: Human-readable playlist name
- `description`: Playlist description
- `image`: Cover image URL
- `t`: Genre/topic tags for discoverability
- `required`: Specifies required tags for list items (we use `r` for RSS URL)
- `recommended`: Suggested tags for list items

### Kind 9999: List Item (Track Pointer)

Adds a track to an existing playlist. Points to an RSS feed enclosure URL.

```json
{
  "kind": 9999,
  "tags": [
    ["z", "<list_id>"],
    ["r", "https://rss.example.com/track.mp3"],
    ["title", "Bitcoin Standard"],
    ["artist", "Satoshi Sound"],
    ["annotation", "Skip to 1:30 for the drop"],
    ["guid", "podcast-guid-here"],
    ["feed", "https://example.com/feed.rss"],
    ["value", "lnurl1..."]
  ],
  "content": "",
  "id": "<item_id>"
}
```

**Tags:**
- `z`: Required. References the parent list (kind 9998 event ID)
- `r`: Required. The RSS enclosure URL (direct link to audio file)
- `title`: Track title
- `artist`: Artist name
- `annotation`: Optional curator note (e.g., "Skip to 1:30")
- `guid`: Podcast GUID from the RSS feed (for Podcast Index lookup)
- `feed`: Original RSS feed URL
- `value`: Lightning payment info (lnurl or value tag data)

### Kind 10040: Trusted Service Providers

Declares which NIP-85 service providers the user trusts for assertions.

```json
{
  "kind": 10040,
  "tags": [
    ["30382:rank", "<provider_pubkey>", "wss://relay.example.com"]
  ],
  "content": ""
}
```

### Kind 30382: Trusted Assertions (User Stats)

Service provider assertions about user reputation/stats.

```json
{
  "kind": 30382,
  "tags": [
    ["d", "<user_pubkey>"],
    ["p", "<user_pubkey>", "<relay_hint>"],
    ["rank", "85"],
    ["followers", "1200"],
    ["zap_amt_recd", "500000"]
  ],
  "content": ""
}
```

## Web-of-Trust Calculation

TrustWave uses a 2-depth Web-of-Trust model:

1. **Depth 0**: Users the current user directly follows (from kind 3 events)
2. **Depth 1**: Users that Depth 0 users follow

The "Trusted View" filter shows only tracks added by users in the trust graph.

## Music Source Integration

TrustWave is designed to work with any RSS-based music source:

1. **Podcast Index API** (preferred) - Searchable index of V4V-enabled podcasts/music
2. **Direct RSS feeds** - Any RSS feed with audio enclosures
3. **Mock data** - For development/testing

The `r` tag in list items always points to the RSS enclosure URL, which is the "source of truth" for the audio content.

## V4V (Value-for-Value) Payments

When a track has V4V payment information:

1. The `value` tag contains the Lightning payment destination
2. Users can zap the artist directly from the player
3. Zaps are recorded on Nostr (kind 9735) and serve as social proof

## List Visibility Rules

From the architecture document:

> "Users need to see the List Container even if they don't follow the List Creator, provided a Friend added a song to it."

This means:
1. Lists are globally discoverable by search/browse
2. The WoT filter applies to **items within lists**, not lists themselves
3. In "Trusted View", only items added by trusted users are shown
