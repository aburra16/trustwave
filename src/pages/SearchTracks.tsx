/**
 * Search tracks page - Curator tool for finding music to add to lists
 */

import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Search, Radio, ArrowLeft, Music, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Layout } from '@/components/Layout';
import { TrackCard } from '@/components/TrackCard';
import { AddToListDialog } from '@/components/AddToListDialog';
import { mockMusicSource, mockTracks } from '@/lib/mockMusicData';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { TrackMetadata } from '@/lib/musicTypes';

export default function SearchTracks() {
  useSeoMeta({
    title: 'Find Tracks - TrustWave',
    description: 'Search for music to add to your playlists.',
  });

  const { user } = useCurrentUser();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TrackMetadata[]>([]);
  const [featured, setFeatured] = useState<TrackMetadata[]>(mockTracks.slice(0, 6));
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TrackMetadata | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const searchResults = await mockMusicSource.search(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToList = (track: TrackMetadata) => {
    setSelectedTrack(track);
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
            Search for music and add it to your playlists
          </p>
        </div>

        {/* Search bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by artist, track name, or album..."
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
            <p className="text-xs text-muted-foreground mt-2">
              Currently using mock data. Podcast Index integration coming soon!
            </p>
          </CardContent>
        </Card>

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

        {!isSearching && hasSearched && results.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No results found</h3>
              <p className="text-muted-foreground text-sm">
                Try a different search term
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
              Featured Tracks
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onAddToList={() => handleAddToList(track)}
                />
              ))}
            </div>
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
