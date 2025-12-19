/**
 * Card component for displaying a music list/playlist
 */

import { Link } from 'react-router-dom';
import { Music, User, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthor } from '@/hooks/useAuthor';
import { useListItems } from '@/hooks/useListItems';
import type { MusicList } from '@/lib/musicTypes';
import { genUserName } from '@/lib/genUserName';
import { cn } from '@/lib/utils';

interface ListCardProps {
  list: MusicList;
  className?: string;
}

export function ListCard({ list, className }: ListCardProps) {
  const author = useAuthor(list.pubkey);
  const { data: items } = useListItems(list.id);
  const trackCount = items?.length || 0;

  return (
    <Link to={`/list/${list.id}`}>
      <Card className={cn(
        'group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        className
      )}>
        {/* Cover image */}
        <div className="relative aspect-square">
          {list.image ? (
            <img
              src={list.image}
              alt={list.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center">
              <Music className="w-16 h-16 text-white/80" />
            </div>
          )}
          
          {/* Overlay with track count */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center gap-1 text-white text-sm">
              <Music className="h-4 w-4" />
              <span>{trackCount} tracks</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate group-hover:text-violet-600 transition-colors">
            {list.title}
          </h3>
          
          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {list.description}
            </p>
          )}

          {/* Tags */}
          {list.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {list.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Hash className="h-3 w-3 mr-0.5" />
                  {tag}
                </Badge>
              ))}
              {list.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{list.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Creator */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>by</span>
            <span className="font-medium text-foreground truncate">
              {author.data?.metadata?.name || genUserName(list.pubkey)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/** Compact list card for sidebars */
export function ListCardCompact({ list, className }: ListCardProps) {
  const author = useAuthor(list.pubkey);
  const { data: items } = useListItems(list.id);
  const trackCount = items?.length || 0;

  return (
    <Link to={`/list/${list.id}`}>
      <div className={cn(
        'flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group',
        className
      )}>
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
          {list.image ? (
            <img
              src={list.image}
              alt={list.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Music className="w-5 h-5 text-white/80" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate group-hover:text-violet-600 transition-colors">
            {list.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {trackCount} tracks • {author.data?.metadata?.name || genUserName(list.pubkey)}
          </p>
        </div>
      </div>
    </Link>
  );
}
