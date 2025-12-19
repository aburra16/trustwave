/**
 * List detail page - View tracks in a playlist with WoT filtering
 */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { 
  Play, Pause, Music, User, Hash, ArrowLeft, 
  Globe, Users, Plus, Share, MoreHorizontal,
  Shuffle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layout } from '@/components/Layout';
import { TrackCard } from '@/components/TrackCard';
import { useMusicList } from '@/hooks/useMusicLists';
import { useFilteredListItems } from '@/hooks/useListItems';
import { useAuthor } from '@/hooks/useAuthor';
import { useWebOfTrust } from '@/hooks/useWebOfTrust';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePlayer } from '@/contexts/PlayerContext';
import type { TrustFilter, TrackMetadata } from '@/lib/musicTypes';
import { genUserName } from '@/lib/genUserName';
import { cn } from '@/lib/utils';

export default function ListDetail() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useCurrentUser();
  const { data: wot } = useWebOfTrust();
  const [filter, setFilter] = useState<TrustFilter>('trusted');
  
  const { data: list, isLoading: listLoading } = useMusicList(listId);
  const { data: items, isLoading: itemsLoading } = useFilteredListItems(listId, filter);
  const author = useAuthor(list?.pubkey);
  const { play, setQueue, isPlaying, currentTrack } = usePlayer();

  useSeoMeta({
    title: list ? `${list.title} - TrustWave` : 'Playlist - TrustWave',
    description: list?.description || 'A curated music playlist on TrustWave.',
  });

  const canUseTrustedFilter = user && wot && wot.depth0.size > 0;
  const effectiveFilter = canUseTrustedFilter ? filter : 'global';
  const isLoading = listLoading || itemsLoading;

  // Convert list items to track metadata for playback
  const tracks: TrackMetadata[] = (items || []).map(item => ({
    id: item.id,
    title: item.title,
    artist: item.artist,
    enclosureUrl: item.trackUrl,
    artworkUrl: item.event.tags.find(([k]) => k === 'artwork')?.[1],
    duration: parseInt(item.event.tags.find(([k]) => k === 'duration')?.[1] || '0') || undefined,
  }));

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks, 0);
    }
  };

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setQueue(shuffled, 0);
    }
  };

  const isCurrentListPlaying = currentTrack && tracks.some(t => t.enclosureUrl === currentTrack.enclosureUrl);

  if (listLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="w-48 h-48 rounded-xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
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
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse Lists
                </Button>
              </Link>
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
        <Link to="/discover" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Discover
        </Link>

        {/* List header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Cover image */}
          <div className="w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 shadow-xl">
            {list.image ? (
              <img src={list.image} alt={list.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center">
                <Music className="w-20 h-20 text-white/80" />
              </div>
            )}
          </div>

          {/* List info */}
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">Playlist</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{list.title}</h1>
            
            {list.description && (
              <p className="text-muted-foreground mb-4 max-w-2xl">{list.description}</p>
            )}

            {/* Tags */}
            {list.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {list.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Creator and stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <Link 
                to={`/profile/${list.pubkey}`}
                className="flex items-center gap-2 hover:text-foreground"
              >
                {author.data?.metadata?.picture ? (
                  <img 
                    src={author.data.metadata.picture} 
                    alt="" 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="font-medium">
                  {author.data?.metadata?.name || genUserName(list.pubkey)}
                </span>
              </Link>
              <span>•</span>
              <span>{items?.length || 0} tracks</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={handlePlayAll}
                disabled={tracks.length === 0}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
              >
                {isCurrentListPlaying && isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2 fill-white" />
                    Playing
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2 fill-white" />
                    Play All
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="lg" onClick={handleShuffle} disabled={tracks.length === 0}>
                <Shuffle className="w-5 h-5 mr-2" />
                Shuffle
              </Button>

              {user && (
                <Link to={`/add-track/${listId}`}>
                  <Button variant="outline" size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Track
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Trust filter */}
        {canUseTrustedFilter && (
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
            <div>
              <h3 className="font-medium">Trust Filter</h3>
              <p className="text-sm text-muted-foreground">
                {effectiveFilter === 'trusted' 
                  ? 'Showing tracks from people in your network' 
                  : 'Showing all tracks'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Globe className={cn('h-4 w-4', filter === 'global' && 'text-violet-600')} />
                <span className={filter === 'global' ? 'font-medium' : 'text-muted-foreground'}>All</span>
              </div>
              <Switch
                checked={filter === 'trusted'}
                onCheckedChange={(checked) => setFilter(checked ? 'trusted' : 'global')}
              />
              <div className="flex items-center gap-2 text-sm">
                <Users className={cn('h-4 w-4', filter === 'trusted' && 'text-violet-600')} />
                <span className={filter === 'trusted' ? 'font-medium' : 'text-muted-foreground'}>Trusted</span>
              </div>
            </div>
          </div>
        )}

        {/* Track list */}
        {itemsLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!itemsLoading && (!items || items.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                {effectiveFilter === 'trusted' ? (
                  <Users className="w-8 h-8 text-violet-600" />
                ) : (
                  <Music className="w-8 h-8 text-violet-600" />
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {effectiveFilter === 'trusted' 
                  ? 'No tracks from your network' 
                  : 'No tracks yet'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                {effectiveFilter === 'trusted'
                  ? 'No one in your trust network has added tracks to this list.'
                  : 'Be the first to add a track to this playlist!'}
              </p>
              {effectiveFilter === 'trusted' && (
                <Button variant="outline" onClick={() => setFilter('global')}>
                  <Globe className="w-4 h-4 mr-2" />
                  Show All Tracks
                </Button>
              )}
              {effectiveFilter === 'global' && user && (
                <Link to={`/add-track/${listId}`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Track
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {!itemsLoading && items && items.length > 0 && (
          <div className="space-y-1">
            {items.map((item, index) => (
              <TrackCard
                key={item.id}
                track={{
                  id: item.id,
                  title: item.title,
                  artist: item.artist,
                  enclosureUrl: item.trackUrl,
                  artworkUrl: item.event.tags.find(([k]) => k === 'artwork')?.[1],
                  duration: parseInt(item.event.tags.find(([k]) => k === 'duration')?.[1] || '0') || undefined,
                  valueTag: item.valueTag ? JSON.parse(item.valueTag) : undefined,
                }}
                listItem={item}
                showAddedBy={true}
                compact={true}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
