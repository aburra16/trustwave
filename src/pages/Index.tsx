/**
 * Home page - Activity feed and featured lists
 */

import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Radio, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Layout } from '@/components/Layout';
import { ActivityFeed } from '@/components/ActivityFeed';
import { ListCard } from '@/components/ListCard';
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
  const { data: lists, isLoading: listsLoading } = useMusicLists(12);

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
              <p className="text-lg text-white/80 mb-6">
                No algorithms. No ads. Just music curated by people you trust. 
                Filter the noise and find your next favorite track through genuine social proof.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Get Started
                </Button>
                <Link to="/discover">
                  <Button size="lg" variant="ghost" className="text-white hover:bg-white/20 font-semibold">
                    Explore Lists
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

          {/* Sidebar - Featured Lists */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Featured Lists
              </h2>
              <Link to="/discover">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {listsLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!listsLoading && lists && lists.length > 0 && (
              <div className="space-y-3">
                {lists.slice(0, 5).map((list) => (
                  <Link key={list.id} to={`/list/${list.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500">
                            {list.image && (
                              <img src={list.image} alt={list.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate">{list.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {list.description || `${list.tags.length} genres`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Quick stats for logged in users */}
            {user && wot && wot.depth0.size > 0 && (
              <Card className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 border-violet-200 dark:border-violet-800">
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-violet-600" />
                    Your Trust Network
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-violet-600">{wot.depth0.size}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-fuchsia-600">{wot.depth1.size}</p>
                      <p className="text-xs text-muted-foreground">Extended</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
