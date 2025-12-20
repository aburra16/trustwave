/**
 * Search tracks page - Curator tool for finding music to add to lists
 */

import { useState, useEffect } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Search, Radio, ArrowLeft, Music, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { TrackCard } from '@/components/TrackCard';
import { AddToListDialog } from '@/components/AddToListDialog';
import { podcastIndexSource, isPodcastIndexAvailable } from '@/lib/podcastIndex';
import { mockMusicSource } from '@/lib/mockMusicData';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { TrackMetadata } from '@/lib/musicTypes';

type SourceType = 'podcastindex' | 'mock';

export default function SearchTracks() {
  useSeoMeta({
    title: 'Find Tracks - TrustWave',
    description: 'Search for music to add to your playlists.',
  });

  const { user } = useCurrentUser();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TrackMetadata[]>([]);
  const [featured, setFeatured] = useState<TrackMetadata[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TrackMetadata | null>(null);
  // Use Podcast Index if available, fallback to mock data
  const [source, setSource] = useState<SourceType>(isPodcastIndexAvailable() ? 'podcastindex' : 'mock');
  const [error, setError] = useState<string | null>(null);

  // Load featured tracks on mount
  useEffect(() => {
    loadFeatured();
  }, [source]);

  const loadFeatured = async () => {
    setIsFeaturedLoading(true);
    setError(null);
    try {
      const musicSource = source === 'podcastindex' ? podcastIndexSource : mockMusicSource;
      const tracks = await musicSource.getFeatured?.() || [];
      setFeatured(tracks);
      if (tracks.length === 0 && source === 'podcastindex') {
        setError('Could not load from Podcast Index. Try the mock data source.');
      }
    } catch (err) {
      console.error('Error loading featured:', err);
      setError('Failed to load featured tracks. Try switching to mock data.');
    } finally {
      setIsFeaturedLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setError(null);

    try {
      const musicSource = source === 'podcastindex' ? podcastIndexSource : mockMusicSource;
      const searchResults = await musicSource.search(query);
      setResults(searchResults);
      if (searchResults.length === 0) {
        setError('No results found. Try a different search term or switch sources.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToList = (track: TrackMetadata) => {
    setSelectedTrack(track);
  };

  const toggleSource = () => {
    const newSource = source === 'podcastindex' ? 'mock' : 'podcastindex';
    setSource(newSource);
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <Radio className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Sign in to curate</h2>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to search for tracks and add them to playlists.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            Find Tracks
          </h1>
          <p className="text-muted-foreground">
            Search for V4V music and add it to your playlists
          </p>
        </div>

        {/* Search bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by artist, track name, or genre..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>

            {/* Source toggle */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Source:</span>
                  {isPodcastIndexAvailable() ? (
                    <Badge
                      variant={source === 'podcastindex' ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={toggleSource}
                    >
                      {source === 'podcastindex' ? '🎙️ Podcast Index' : '🎵 Mock Data'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      🎵 Mock Data
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={loadFeatured} disabled={isFeaturedLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isFeaturedLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              {!isPodcastIndexAvailable() && (
                <p className="text-xs text-muted-foreground">
                  💡 To enable Podcast Index, deploy the Cloudflare Worker proxy (see README)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <CardContent className="py-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Search results */}
        {isSearching && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="aspect-square" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No results found</h3>
              <p className="text-muted-foreground text-sm">
                Try a different search term or switch to {source === 'podcastindex' ? 'mock data' : 'Podcast Index'}
              </p>
            </CardContent>
          </Card>
        )}

        {!isSearching && hasSearched && results.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Search Results ({results.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onAddToList={() => handleAddToList(track)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Featured tracks (shown when not searching) */}
        {!hasSearched && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {source === 'podcastindex' ? 'Recent V4V Music' : 'Featured Tracks'}
            </h2>

            {isFeaturedLoading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isFeaturedLoading && featured.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onAddToList={() => handleAddToList(track)}
                  />
                ))}
              </div>
            )}

            {!isFeaturedLoading && featured.length === 0 && !error && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No tracks available</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Try searching for something specific or switch sources
                  </p>
                  <Button variant="outline" onClick={toggleSource}>
                    Switch to {source === 'podcastindex' ? 'Mock Data' : 'Podcast Index'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Add to list dialog */}
        {selectedTrack && (
          <AddToListDialog
            track={selectedTrack}
            open={!!selectedTrack}
            onOpenChange={(open) => !open && setSelectedTrack(null)}
          />
        )}
      </div>
    </Layout>
  );
}
