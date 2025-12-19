/**
 * Mock music data for development
 * This will be replaced with Podcast Index API later
 */

import type { TrackMetadata, StarterPack } from './musicTypes';

/** Mock tracks representing V4V-enabled music */
export const mockTracks: TrackMetadata[] = [
  {
    id: 'track-1',
    title: 'Bitcoin Standard',
    artist: 'Satoshi Sound',
    album: 'Digital Gold',
    duration: 234,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop',
    description: 'An electronic tribute to sound money',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '1000',
      recipients: [
        { name: 'Satoshi Sound', type: 'node', address: 'fake-node-id-1', split: 100 }
      ]
    }
  },
  {
    id: 'track-2',
    title: 'Proof of Work',
    artist: 'The Miners',
    album: 'Hash Power',
    duration: 198,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    description: 'Heavy beats for heavy computation',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '500',
      recipients: [
        { name: 'The Miners', type: 'node', address: 'fake-node-id-2', split: 100 }
      ]
    }
  },
  {
    id: 'track-3',
    title: 'Lightning Fast',
    artist: 'Node Runner',
    album: 'Layer Two',
    duration: 267,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    description: 'Speed and efficiency in audio form',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '2100',
      recipients: [
        { name: 'Node Runner', type: 'node', address: 'fake-node-id-3', split: 100 }
      ]
    }
  },
  {
    id: 'track-4',
    title: 'Decentralized Dreams',
    artist: 'P2P Collective',
    album: 'No Middlemen',
    duration: 312,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    description: 'Ambient soundscapes for the sovereign individual',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '1000',
      recipients: [
        { name: 'P2P Collective', type: 'node', address: 'fake-node-id-4', split: 100 }
      ]
    }
  },
  {
    id: 'track-5',
    title: 'HODL On',
    artist: 'Diamond Hands',
    album: 'Never Selling',
    duration: 245,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    description: 'Motivational anthem for long-term holders',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '2100',
      recipients: [
        { name: 'Diamond Hands', type: 'node', address: 'fake-node-id-5', split: 100 }
      ]
    }
  },
  {
    id: 'track-6',
    title: 'Genesis Block',
    artist: 'The Timestamps',
    album: 'January 3, 2009',
    duration: 189,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
    description: 'The beginning of everything',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '1000',
      recipients: [
        { name: 'The Timestamps', type: 'node', address: 'fake-node-id-6', split: 100 }
      ]
    }
  },
  {
    id: 'track-7',
    title: 'Chill V4V',
    artist: 'Zap Masters',
    album: 'Value Flows',
    duration: 356,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    description: 'Relaxing tunes for the value-conscious listener',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '500',
      recipients: [
        { name: 'Zap Masters', type: 'node', address: 'fake-node-id-7', split: 100 }
      ]
    }
  },
  {
    id: 'track-8',
    title: 'Nostr Nights',
    artist: 'Protocol Punk',
    album: 'Decentralized Social',
    duration: 278,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1571974599782-87624638275e?w=300&h=300&fit=crop',
    description: 'The sound of censorship resistance',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '1000',
      recipients: [
        { name: 'Protocol Punk', type: 'node', address: 'fake-node-id-8', split: 100 }
      ]
    }
  },
  {
    id: 'track-9',
    title: 'Deep Focus',
    artist: 'Ambient Node',
    album: 'Concentration',
    duration: 420,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop',
    description: 'Perfect for coding sessions',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '500',
      recipients: [
        { name: 'Ambient Node', type: 'node', address: 'fake-node-id-9', split: 100 }
      ]
    }
  },
  {
    id: 'track-10',
    title: 'Stack Sats',
    artist: 'DCA Daily',
    album: 'Accumulation',
    duration: 203,
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop',
    description: 'Your daily reminder to stack',
    valueTag: {
      type: 'lightning',
      method: 'keysend',
      suggested: '2100',
      recipients: [
        { name: 'DCA Daily', type: 'node', address: 'fake-node-id-10', split: 100 }
      ]
    }
  },
];

/** Mock starter packs for cold start onboarding */
export const mockStarterPacks: StarterPack[] = [
  {
    genre: 'bitcoin',
    displayName: 'Bitcoin & Crypto',
    description: 'Top curators for Bitcoin-themed music',
    curators: [
      '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // jack
      'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
    ]
  },
  {
    genre: 'electronic',
    displayName: 'Electronic & Synth',
    description: 'Discover electronic music curators',
    curators: [
      '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d', // fiatjaf
      '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245', // jb55
    ]
  },
  {
    genre: 'chill',
    displayName: 'Chill & Ambient',
    description: 'Relaxing vibes and focus music',
    curators: [
      'e88a691e98d9987c964521dff60025f60700378a4879180dcbbb4a5027850411', // NVK
      '472f440f29ef996e92a186b8d320ff180c855903b8f4eae76e7c2b7a27c80758', // fish
    ]
  },
  {
    genre: 'rock',
    displayName: 'Rock & Alternative',
    description: 'Rock music enthusiasts',
    curators: [
      '50d94fc2d8580c682b071a542f8b1e31a200b0508bab95a33bef0855df281d63', // calle
      'c4eabae1be3cf657bc1855ee05e69de9f059cb7a059227168b80b89761cbc4e0', // jack mallers
    ]
  },
];

/** Mock music source provider */
export const mockMusicSource = {
  name: 'Mock Music',
  
  async search(query: string): Promise<TrackMetadata[]> {
    const lowerQuery = query.toLowerCase();
    return mockTracks.filter(track => 
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.album?.toLowerCase().includes(lowerQuery) ||
      track.description?.toLowerCase().includes(lowerQuery)
    );
  },
  
  async getTrack(id: string): Promise<TrackMetadata | null> {
    return mockTracks.find(t => t.id === id) || null;
  },
  
  async getFeatured(): Promise<TrackMetadata[]> {
    // Return a shuffled subset
    return [...mockTracks].sort(() => Math.random() - 0.5).slice(0, 6);
  }
};
