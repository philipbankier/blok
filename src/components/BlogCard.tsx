import React from 'react';
import { Heart, User, Share2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  url: string;
  image_url: string;
  author_name?: string;
  blog_authors?: {
    name: string;
    author_image_url: string;
  } | null;
}

interface Props {
  post: BlogPost;
  isFavorited: boolean;
  onFavoriteToggle: () => void;
  isAuthenticated: boolean;
}

export function BlogCard({ post, isFavorited, onFavoriteToggle, isAuthenticated }: Props) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: post.url
        });
      } else {
        await navigator.clipboard.writeText(post.url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="glass-card rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-[75vh] sm:h-[85vh] relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={post.image_url}
            alt={post.title}
            loading="lazy"
          />
          <div className="absolute top-6 left-6 right-6 z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
              {post.blog_authors?.author_image_url ? (
                <img
                  src={post.blog_authors.author_image_url}
                  alt={post.blog_authors.name || 'Author'}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full glass-effect flex items-center justify-center">
                  <User className="w-4 h-4 text-white/70" />
                </div>
              )}
              <span className="text-white text-sm font-medium">
                {post.author_name || 'Anonymous'}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 bg-gradient-to-t from-black via-black/95 to-transparent z-20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white leading-tight">
              {post.title}
            </h2>
            <p className="text-base text-white/90 mb-8 leading-relaxed font-medium max-w-3xl">
              {post.summary}
            </p>
            <div className="flex justify-between items-center">
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glow bg-gradient-to-r from-blue-500 to-blue-300 text-white px-8 py-3 rounded-xl hover:opacity-90 transition-all text-base font-medium"
              >
                Read More
              </a>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full hover:bg-white/10 transition-colors group/share"
                  aria-label="Share article"
                >
                  <Share2 className="w-7 h-7 text-white/70 group-hover/share:text-blue-400 transition-colors" />
                </button>
                {isAuthenticated && (
                  <button
                    onClick={onFavoriteToggle}
                    className="p-3 rounded-full hover:bg-white/10 transition-colors group/heart"
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-7 h-7 transition-all duration-300 ${
                        isFavorited 
                          ? 'fill-red-500 text-red-500 animate-pulse-glow' 
                          : 'text-white/70 group-hover/heart:text-red-500'
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}