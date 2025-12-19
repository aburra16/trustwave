/**
 * Main app layout with header, sidebar, and player bar
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, PlusCircle, Radio, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoginArea } from '@/components/auth/LoginArea';
import { PlayerBar } from '@/components/PlayerBar';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/discover', icon: Search, label: 'Discover' },
  { path: '/library', icon: Library, label: 'Library' },
];

const curatorItems = [
  { path: '/create', icon: PlusCircle, label: 'New List' },
  { path: '/search-tracks', icon: Radio, label: 'Find Tracks' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              TrustWave
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <LoginArea className="max-w-48" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    location.pathname === item.path && 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {user && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Curator Tools
              </div>
              <nav className="space-y-1">
                {curatorItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3',
                        location.pathname === item.path && 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </>
          )}

          <div className="mt-auto pt-4 border-t">
            <Link to="/settings">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </Link>
            <div className="mt-4 px-3 text-xs text-muted-foreground">
              <a 
                href="https://shakespeare.diy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-violet-600 transition-colors"
              >
                Vibed with Shakespeare
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-24">
          {children}
        </main>
      </div>

      {/* Player Bar */}
      <PlayerBar />

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-40 pb-safe">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'flex flex-col items-center gap-1 h-auto py-2',
                  location.pathname === item.path && 'text-violet-600'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          ))}
          {user && (
            <Link to="/create">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'flex flex-col items-center gap-1 h-auto py-2',
                  location.pathname === '/create' && 'text-violet-600'
                )}
              >
                <PlusCircle className="h-5 w-5" />
                <span className="text-xs">Create</span>
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
