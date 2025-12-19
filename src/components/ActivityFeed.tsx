/**
 * Activity feed showing recent list/track activity
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Plus, Filter, Users, Globe, Play, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRecentListItems, useTrustedListItems } from '@/hooks/useListItems';
import { useMusicLists, useMusicList } from '@/hooks/useMusicLists';
import { useAuthor } from '@/hooks/useAuthor';
import { useIsInWot, useWebOfTrust } from '@/hooks/useWebOfTrust';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePlayer } from '@/contexts/PlayerContext';
import type { ListItem, TrustFilter } from '@/lib/musicTypes';
import { genUserName } from '@/lib/genUserName';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  item: ListItem;
}

function ActivityItem({ item }: ActivityItemProps) {
  const { data: list } = useMusicList(item.listId);
  const author = useAuthor(item.pubkey);
  const { isInWot, depth } = useIsInWot(item.pubkey);
  const { play } = usePlayer();

  const handlePlay = () => {
    play({
      id: item.id,
      title: item.title,
      artist: item.artist,
      enclosureUrl: item.trackUrl,
      artworkUrl: item.event.tags.find(([k]) => k === 'artwork')?.[1],
    }, item);
  };

  const timeAgo = getTimeAgo(item.createdAt);
  const authorName = author.data?.metadata?.name || genUserName(item.pubkey);

  return (
    <div className="flex gap-3 p-4 hover:bg-muted/30 transition-colors rounded-lg group">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {author.data?.metadata?.picture ? (
          <img
            src={author.data.metadata.picture}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{authorName}</span>
          {isInWot && (
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              {depth === 0 ? 'Following' : 'WoT'}
            </Badge>
          )}
          <span className="text-muted-foreground text-sm">added a track to</span>
          {list ? (
            <Link 
              to={`/list/${list.id}`}
              className="font-medium text-violet-600 hover:underline"
            >
              {list.title}
            </Link>
          ) : (
            <span className="text-muted-foreground">a list</span>
          )}
        </div>

        {/* Track info */}
        <div 
          className="mt-2 flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
          onClick={handlePlay}
        >
          <div className="w-12 h-12 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
          </div>
        </div>

        {/* Annotation */}
        {item.annotation && (
          <p className="mt-2 text-sm italic text-muted-foreground">
            "{item.annotation}"
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  const { user } = useCurrentUser();
  const { data: wot } = useWebOfTrust();
  const [filter, setFilter] = useState<TrustFilter>('trusted');

  const { data: globalItems, isLoading: globalLoading } = useRecentListItems(30);
  const { data: trustedItems, isLoading: trustedLoading } = useTrustedListItems(30);

  // Use trusted filter only if user is logged in and has follows
  const canUseTrustedFilter = user && wot && wot.depth0.size > 0;
  const effectiveFilter = canUseTrustedFilter ? filter : 'global';
  
  const items = effectiveFilter === 'trusted' ? trustedItems : globalItems;
  const isLoading = effectiveFilter === 'trusted' ? trustedLoading : globalLoading;

  return (
    <div className={className}>
      {/* Filter toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Activity</h2>
        
        {canUseTrustedFilter && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Globe className={cn('h-4 w-4', filter === 'global' && 'text-violet-600')} />
              <span className={filter === 'global' ? 'font-medium' : 'text-muted-foreground'}>
                Global
              </span>
            </div>
            <Switch
              checked={filter === 'trusted'}
              onCheckedChange={(checked) => setFilter(checked ? 'trusted' : 'global')}
            />
            <div className="flex items-center gap-2 text-sm">
              <Users className={cn('h-4 w-4', filter === 'trusted' && 'text-violet-600')} />
              <span className={filter === 'trusted' ? 'font-medium' : 'text-muted-foreground'}>
                Trusted
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!items || items.length === 0) && (
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
                ? 'No activity from your network' 
                : 'No activity yet'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {effectiveFilter === 'trusted'
                ? 'Follow more curators to see their activity, or switch to Global view.'
                : 'Be the first to add a track to a playlist!'}
            </p>
            {effectiveFilter === 'trusted' && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setFilter('global')}
              >
                <Globe className="w-4 h-4 mr-2" />
                View Global Activity
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity items */}
      {!isLoading && items && items.length > 0 && (
        <div className="divide-y">
          {items.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
