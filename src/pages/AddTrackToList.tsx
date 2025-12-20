/**
 * Add track to a specific list page
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Search, ArrowLeft, Music, Loader2, RefreshCw, Plus, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Layout } from '@/components/Layout';
import { TrackCard } from '@/components/TrackCard';
import { FeedTrackBrowser } from '@/components/FeedTrackBrowser';
import { useMusicList } from '@/hooks/useMusicLists';
import { useAddTrackToList } from '@/hooks/useAddTrackToList';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { podcastIndexSource, isPodcastIndexAvailable } from '@/lib/podcastIndex';
import { mockMusicSource } from '@/lib/mockMusicData';
import type { TrackMetadata } from '@/lib/musicTypes';

type SourceType = 'podcastindex' | 'mock';

export default function AddTrackToList() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const { data: list, isLoading: listLoading } = useMusicList(listId);
  const { mutateAsync: addTrack, isPending: isAdding } = useAddTrackToList();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TrackMetadata[]>([]);
  const [featured, setFeatured] = useState<TrackMetadata[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  // Default to mock data since Podcast Index requires a backend proxy for CORS
  const [source, setSource] = useState<SourceType>('mock');
  const [error, setError] = useState<string | null>(null);

  // Feed browsing state
  const [browseFeed, setBrowseFeed] = useState<TrackMetadata | null>(null);

  // Dialog state
  const [selectedTrack, setSelectedTrack] = useState<TrackMetadata | null>(null);
  const [annotation, setAnnotation] = useState('');
  const [addedTracks, setAddedTracks] = useState<Set<string>>(new Set());

  useSeoMeta({
    title: list ? `Add to ${list.title} - TrustWave` : 'Add Track - TrustWave',
    description: 'Search for music to add to your playlist.',
  });

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

  const handleBrowseFeed = (feed: TrackMetadata) => {
    setBrowseFeed(feed);
  };

  const handleSelectTrack = (track: TrackMetadata) => {
    setSelectedTrack(track);
    setAnnotation('');
  };

  const handleBackFromBrowser = () => {
    setBrowseFeed(null);
  };

  const handleAddTrack = async () => {
    if (!selectedTrack || !listId) return;

    try {
      let trackToAdd = selectedTrack;

      // For podcast feeds, fetch the first episode to get duration and other metadata
      const isRSSFeed = selectedTrack.enclosureUrl.match(/\.(xml|rss)$/i) ||
                       selectedTrack.enclosureUrl.includes('feed') ||
                       !selectedTrack.enclosureUrl.match(/\.(mp3|m4a|ogg|wav)$/i);

      if (isRSSFeed && selectedTrack.feedUrl) {
        console.log('📻 Fetching episode details for duration...');
        const { getFirstEpisodeFromFeed } = await import('@/lib/rssParser');
        const episode = await getFirstEpisodeFromFeed(selectedTrack.feedUrl, selectedTrack);

        console.log('📻 Episode fetched:', episode);

        if (episode) {
          // Update the track with the episode's duration while keeping feed URL
          trackToAdd = {
            ...selectedTrack,
            duration: episode.duration,
          };
          console.log('✅ Got episode duration:', episode.duration, 'seconds');
        } else {
          console.log('⚠️ No episode found in feed');
        }
      }

      await addTrack({
        listId,
        track: trackToAdd,
        annotation: annotation.trim() || undefined,
      });

      setAddedTracks(prev => new Set(prev).add(selectedTrack.id));
      setSelectedTrack(null);
      setAnnotation('');

      toast({
        title: 'Track added!',
        description: `"${selectedTrack.title}" has been added to ${list?.title}`,
      });
    } catch (err) {
      console.error('Error adding track:', err);
      toast({
        title: 'Error',
        description: 'Failed to add track. Please try again.',
        variant: 'destructive',
      });
    }
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
                <Music className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Sign in to add tracks</h2>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to add tracks to playlists.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (listLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-8" />
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
        </div>
      </Layout>
    );
  }

  if (!list) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold mb-2">List not found</h2>
              <p className="text-muted-foreground mb-4">
                This playlist doesn't exist or has been removed.
              </p>
              <Link to="/discover">
                <Button>Browse Lists</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const displayTracks = hasSearched ? results : featured;

  return (
    <Layout>
      <div className="container py-8">
        {/* Back button */}
        <Link
          to={`/list/${listId}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {list.title}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add Track to "{list.title}"</h1>
          <p className="text-muted-foreground">
            Search for V4V music to add to this playlist
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

        {/* Feed track browser - shows when browsing a specific feed/album */}
        {browseFeed ? (
          <FeedTrackBrowser
            feed={browseFeed}
            onSelectTrack={handleSelectTrack}
            onBack={handleBackFromBrowser}
            addedTrackIds={addedTracks}
          />
        ) : (
          <>
            {/* Results section header */}
            <h2 className="text-lg font-semibold mb-4">
              {hasSearched ? `Search Results (${results.length})` : 'Featured Music'}
            </h2>

            {/* Loading state */}
            {(isSearching || isFeaturedLoading) && (
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

            {/* Empty state */}
            {!isSearching && !isFeaturedLoading && displayTracks.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {hasSearched ? 'No results found' : 'No music available'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {hasSearched
                      ? 'Try a different search term or switch sources'
                      : 'Try searching for something specific'}
                  </p>
                  <Button variant="outline" onClick={toggleSource}>
                    Switch to {source === 'podcastindex' ? 'Mock Data' : 'Podcast Index'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Feed/Album grid */}
            {!isSearching && !isFeaturedLoading && displayTracks.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTracks.map((feed) => {
              return (
                <Card
                  key={feed.id}
                  className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                  onClick={() => handleBrowseFeed(feed)}
                >
                  {/* Artwork */}
                  <div className="relative aspect-square">
                    {feed.artworkUrl ? (
                      <img
                        src={feed.artworkUrl}
                        alt={feed.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity opacity-0 group-hover:opacity-100">
                      <Button variant="secondary" size="sm">
                        <Music className="w-4 h-4 mr-2" />
                        Browse Tracks
                      </Button>
                    </div>

                    {/* V4V badge */}
                    {feed.valueTag && (
                      <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 gap-1">
                        V4V
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{feed.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{feed.artist}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
          </>
        )}

        {/* Add track dialog */}
        <Dialog open={!!selectedTrack} onOpenChange={(open) => !open && setSelectedTrack(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Track</DialogTitle>
              <DialogDescription>
                Add "{selectedTrack?.title}" to {list.title}
              </DialogDescription>
            </DialogHeader>

            {selectedTrack && (
              <div className="space-y-4">
                {/* Track preview */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {selectedTrack.artworkUrl ? (
                    <img
                      src={selectedTrack.artworkUrl}
                      alt={selectedTrack.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{selectedTrack.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{selectedTrack.artist}</p>
                  </div>
                </div>

                {/* Annotation input */}
                <div className="space-y-2">
                  <Label htmlFor="annotation">Curator Note (optional)</Label>
                  <Textarea
                    id="annotation"
                    placeholder="e.g., 'Skip to 1:30 for the drop' or 'Great for late night coding'"
                    value={annotation}
                    onChange={(e) => setAnnotation(e.target.value)}
                    rows={2}
                    maxLength={280}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a note to help listeners discover the best parts
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAddTrack}
                    disabled={isAdding}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to List
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTrack(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
