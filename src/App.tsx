import React, { useEffect, useState, useRef, useCallback } from 'react';
import { LogIn, LogOut, Heart, MessageSquare } from 'lucide-react';
import { supabase } from './lib/supabase';
import { BlogCard } from './components/BlogCard';
import { AuthModal } from './components/AuthModal';
import { ThemeToggle } from './components/ThemeToggle';
import { FavoritesModal } from './components/FavoritesModal';
import { FeedbackModal } from './components/FeedbackModal';
import { trackViewedPost, migrateViewedPosts, getUnviewedPosts, setupTabSync } from './lib/postTracking';
import { Session } from '@supabase/supabase-js';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  url: string;
  image_url: string;
  blog_authors?: {
    name: string;
    author_image_url: string;
  } | null;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritePosts, setFavoritePosts] = useState<BlogPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const pageRef = useRef(0);

  useEffect(() => {
    setupTabSync();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        migrateViewedPosts(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        migrateViewedPosts(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchUnviewedPosts(true);
    if (session) {
      fetchFavorites();
    }
  }, [session]);

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    const nextPage = pageRef.current + 1;
    await fetchUnviewedPosts(false, nextPage);
    pageRef.current = nextPage;
  }, [isLoading, hasMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const st = container.scrollTop;
      const height = container.clientHeight;
      const scrollHeight = container.scrollHeight;
      const index = Math.round(st / height);
      
      // Track current post view
      if (index !== currentIndex) {
        setCurrentIndex(index);
        const currentPost = posts[index];
        if (currentPost) {
          trackViewedPost(currentPost.id, session?.user?.id);
        }
      }
      
      // Check if we need to load more posts
      if (!isLoading && hasMore && scrollHeight - (st + height) < height * 2) {
        loadMorePosts();
      }
      
      lastScrollTop.current = st;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, posts, session, loadMorePosts, isLoading, hasMore]);

  async function fetchUnviewedPosts(reset: boolean = false, page: number = 0) {
    try {
      setIsLoading(true);
      const newPosts = await getUnviewedPosts(session?.user?.id, 20, page);
      
      if (reset) {
        setPosts(newPosts);
        pageRef.current = 0;
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 20);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFavorites() {
    const { data, error } = await supabase
      .from('favorites')
      .select('blog_post_id')
      .eq('user_id', session?.user?.id);

    if (error) {
      console.error('Error fetching favorites:', error);
    } else {
      const favoriteIds = data?.map(fav => fav.blog_post_id) || [];
      setFavorites(favoriteIds);
      
      // Fetch the full post data for favorites
      if (favoriteIds.length > 0) {
        const { data: favoritePosts, error: favoritePostsError } = await supabase
          .from('blog_posts')
          .select(`
            *,
            blog_authors (
              name,
              author_image_url
            )
          `)
          .in('id', favoriteIds);

        if (favoritePostsError) {
          console.error('Error fetching favorite posts:', favoritePostsError);
        } else {
          setFavoritePosts(favoritePosts || []);
        }
      } else {
        setFavoritePosts([]);
      }
    }
  }

  async function toggleFavorite(postId: string) {
    if (!session) {
      setAuthMode('signin');
      setAuthModalOpen(true);
      return;
    }

    const isFavorited = favorites.includes(postId);
    
    if (isFavorited) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('blog_post_id', postId);

      if (!error) {
        setFavorites(favorites.filter(id => id !== postId));
        setFavoritePosts(favoritePosts.filter(post => post.id !== postId));
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: session.user.id, blog_post_id: postId }]);

      if (!error) {
        setFavorites([...favorites, postId]);
        const newFavoritePost = posts.find(post => post.id === postId);
        if (newFavoritePost) {
          setFavoritePosts([...favoritePosts, newFavoritePost]);
        }
      }
    }
  }

  async function handleAuth(email: string, password: string) {
    if (authMode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) alert(error.message);
      else setAuthModalOpen(false);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) alert(error.message);
      else {
        alert('Check your email for the confirmation link!');
        setAuthModalOpen(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="glass-effect sticky top-0 z-40 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
            Blok
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Submit feedback"
            >
              <MessageSquare className="w-4 h-4 text-gray-300 hover:text-blue-400 transition-colors" />
            </button>
            {/* <ThemeToggle /> */}
            {!session ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
                <div className="h-4 w-px bg-white/10"></div>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthModalOpen(true);
                  }}
                  className="glow flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-300 text-white px-4 py-2 rounded-full hover:opacity-90 transition-all text-sm font-medium"
                >
                  <span>Get Started</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFavoritesModalOpen(true)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="View favorites"
                >
                  <Heart className="w-4 h-4 text-gray-300 hover:text-blue-400 transition-colors" />
                </button>
                <div className="h-4 w-px bg-white/10"></div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div ref={containerRef} className="snap-container">
        {posts.map((post, index) => (
          <div key={post.id} className="snap-item">
            <BlogCard
              post={{
                ...post,
                author_name: post.blog_authors?.name || 'Anonymous'
              }}
              isFavorited={favorites.includes(post.id)}
              onFavoriteToggle={() => toggleFavorite(post.id)}
              isAuthenticated={!!session}
            />
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSubmit={handleAuth}
      />

      <FavoritesModal
        isOpen={favoritesModalOpen}
        onClose={() => setFavoritesModalOpen(false)}
        favorites={favoritePosts}
        onFavoriteToggle={toggleFavorite}
        favoritedIds={favorites}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </div>
  );
}

export default App;