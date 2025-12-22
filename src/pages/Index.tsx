/**
 * Home page - Activity feed and featured lists
 */

import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Radio, Users, Music, TrendingUp, Disc3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Layout } from '@/components/Layout';
import { ActivityFeed } from '@/components/ActivityFeed';
import { ListCard, ListCardCompact } from '@/components/ListCard';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { useMusicLists } from '@/hooks/useMusicLists';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWebOfTrust } from '@/hooks/useWebOfTrust';

export default function Index() {
  useSeoMeta({
    title: 'TrustWave - Discover Music Through Trust',
    description: 'A decentralized music discovery app that filters content through your Web-of-Trust.',
  });

  const { user } = useCurrentUser();
  const { data: wot, isLoading: wotLoading } = useWebOfTrust();
  const { data: lists, isLoading: listsLoading } = useMusicLists(8);

  // Show onboarding if user is logged in but has no follows
  const showOnboarding = user && !wotLoading && wot && wot.depth0.size === 0;

  return (
    <Layout>
      <div className="container py-8">
        {/* Hero section for logged out users */}
        {!user && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white p-8 md:p-12 mb-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Radio className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold">TrustWave</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Discover Music Through Your Web of Trust
              </h1>
              <p className="text-lg text-white/90 mb-6">
                No algorithms. No ads. Just music curated by people you trust.
                Filter the noise and find your next favorite track through genuine social proof.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Get Started
                </Button>
                <Link to="/discover">
                  <Button size="lg" variant="ghost" className="text-white hover:bg-white/20 font-semibold">
                    Explore Playlists
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-10 top-10 w-32 h-32 rounded-full bg-pink-400/20 blur-2xl" />
          </div>
        )}

        {/* Onboarding for new users */}
        {showOnboarding && <OnboardingFlow />}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content - Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>

          {/* Sidebar - Featured Lists & Stats */}
          <div className="space-y-6">
            {/* Featured Playlists */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                  Trending Playlists
                </h2>
                <Link to="/discover">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {listsLoading && (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3 p-2">
                      <Skeleton className="w-12 h-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!listsLoading && lists && lists.length > 0 && (
                <div className="space-y-2">
                  {lists.slice(0, 6).map((list) => (
                    <ListCardCompact key={list.id} list={list} />
                  ))}
                </div>
              )}

              {!listsLoading && (!lists || lists.length === 0) && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <Music className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No playlists yet. {user ? 'Create the first one!' : 'Sign in to get started.'}
                    </p>
                    {user && (
                      <Link to="/create">
                        <Button size="sm" variant="outline" className="mt-3">
                          Create Playlist
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Trust Network Stats for logged in users */}
            {user && wot && wot.depth0.size > 0 && (
              <Card className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 border-violet-200 dark:border-violet-800">
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-violet-600" />
                    Your Trust Network
                  </h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-violet-600 mb-1">{wot.depth0.size}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    See tracks from {wot.all.size} curators in your network
                  </p>
                </CardContent>
              </Card>
            )}

            {/* How it Works card */}
            {!user && (
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-5">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Disc3 className="w-5 h-5 text-blue-600" />
                    How It Works
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <span>Follow curators whose taste you trust</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>See only tracks they've added to playlists</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <span>Discover new music without the noise</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
