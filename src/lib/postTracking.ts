import { supabase } from './supabase';

interface ViewedPost {
  postId: string;
  viewedAt: string;
}

const VIEWED_POSTS_KEY = 'viewedPosts';
const BATCH_SIZE = 50;

// Error logging utility
function logError(error: any, context: string) {
  console.error(`Error in ${context}:`, error);
  // You could extend this to send to an error tracking service
}

// Local storage utilities with error handling
function getLocalViewedPosts(): ViewedPost[] {
  try {
    const stored = localStorage.getItem(VIEWED_POSTS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logError(error, 'getLocalViewedPosts');
    return [];
  }
}

function setLocalViewedPosts(posts: ViewedPost[]) {
  try {
    localStorage.setItem(VIEWED_POSTS_KEY, JSON.stringify(posts));
  } catch (error) {
    logError(error, 'setLocalViewedPosts');
  }
}

// Track when a user views a post
export async function trackViewedPost(postId: string, userId?: string) {
  const viewedAt = new Date().toISOString();

  try {
    // Always update localStorage
    const localPosts = getLocalViewedPosts();
    const updatedPosts = [
      ...localPosts.filter(p => p.postId !== postId),
      { postId, viewedAt }
    ];
    setLocalViewedPosts(updatedPosts);

    // If user is logged in, also update database
    if (userId) {
      const { error } = await supabase
        .from('viewed_posts')
        .upsert({
          user_id: userId,
          post_id: postId,
          viewed_at: viewedAt
        }, {
          onConflict: 'user_id,post_id'
        });

      if (error) throw error;
    }
  } catch (error) {
    logError(error, 'trackViewedPost');
  }
}

// Migrate local viewed posts to database when user logs in
export async function migrateViewedPosts(userId: string): Promise<boolean> {
  try {
    const localPosts = getLocalViewedPosts();
    if (localPosts.length === 0) return true;

    // Process in batches
    for (let i = 0; i < localPosts.length; i += BATCH_SIZE) {
      const batch = localPosts.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('viewed_posts')
        .upsert(
          batch.map(post => ({
            user_id: userId,
            post_id: post.postId,
            viewed_at: post.viewedAt
          })),
          { onConflict: 'user_id,post_id' }
        );

      if (error) throw error;
    }

    // Clear localStorage only after successful migration
    localStorage.removeItem(VIEWED_POSTS_KEY);
    return true;
  } catch (error) {
    logError(error, 'migrateViewedPosts');
    return false;
  }
}

// Updated getUnviewedPosts function with pagination
export async function getUnviewedPosts(userId: string | undefined, limit: number = 20, page: number = 0) {
  try {
    let viewedPostIds: string[] = [];
    
    if (userId) {
      const { data: viewedPosts, error: viewedError } = await supabase
        .from('viewed_posts')
        .select('post_id')
        .eq('user_id', userId);

      if (viewedError) throw viewedError;
      viewedPostIds = viewedPosts?.map(post => post.post_id) || [];
    } else {
      const localPosts = getLocalViewedPosts();
      viewedPostIds = localPosts.map(p => p.postId);
    }

    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        blog_authors (
          name,
          author_image_url
        )
      `)
      .order('created_at', { ascending: false });

    if (viewedPostIds.length > 0) {
      query = query.not('id', 'in', `(${viewedPostIds.join(',')})`);
    }

    // Add pagination
    query = query.range(page * limit, (page + 1) * limit - 1);

    const { data: posts, error } = await query;

    if (error) throw error;

    return posts || [];
  } catch (error) {
    logError(error, 'getUnviewedPosts');
    return [];
  }
}

// Sync viewed posts across tabs
export function setupTabSync() {
  try {
    window.addEventListener('storage', (event) => {
      if (event.key === VIEWED_POSTS_KEY) {
        try {
          // Validate the new value is proper JSON
          const newValue = event.newValue ? JSON.parse(event.newValue) : [];
          if (!Array.isArray(newValue)) throw new Error('Invalid viewed posts data');
          
          // Merge with existing posts, keeping the latest viewedAt
          const existingPosts = getLocalViewedPosts();
          const merged = [...existingPosts];
          
          newValue.forEach(newPost => {
            const existingIndex = merged.findIndex(p => p.postId === newPost.postId);
            if (existingIndex === -1) {
              merged.push(newPost);
            } else if (new Date(newPost.viewedAt) > new Date(merged[existingIndex].viewedAt)) {
              merged[existingIndex] = newPost;
            }
          });
          
          setLocalViewedPosts(merged);
        } catch (error) {
          logError(error, 'tabSync:parse');
        }
      }
    });
  } catch (error) {
    logError(error, 'setupTabSync');
  }
}