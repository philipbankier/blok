import React from 'react';
import { X, Heart } from 'lucide-react';
import { BlogCard } from './BlogCard';

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

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: BlogPost[];
  onFavoriteToggle: (postId: string) => void;
  favoritedIds: string[];
}

export function FavoritesModal({ 
  isOpen, 
  onClose, 
  favorites,
  onFavoriteToggle,
  favoritedIds
}: FavoritesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl relative animate-fade-in mt-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
            Your Favorites
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white/80 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto text-white/20 mb-4" />
            <p className="text-white/60">
              You haven't favorited any posts yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {favorites.map(post => (
              <BlogCard
                key={post.id}
                post={post}
                isFavorited={favoritedIds.includes(post.id)}
                onFavoriteToggle={() => onFavoriteToggle(post.id)}
                isAuthenticated={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}