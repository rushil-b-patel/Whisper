import PostCard from '../ui/PostCard';
import { useNavigate } from 'react-router-dom';
import { PostCardSkeleton } from '../ui/PostCardSkeleton';

export default function Feed({ isLoading, error, filteredPosts, fetchPosts }) {
  const navigate = useNavigate();

  return (
    <main className="flex-1 max-w-2xl mx-auto px-2 py-4 overflow-y-auto feed-scrollbar-hidden">
      {isLoading ? (
        <div className="space-y-4 pb-20">
          {Array.from({ length: 3 }).map((_, idx) => (
            <PostCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium text-sm transition"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Be the first to share something with the community!
              </p>
              <button
                onClick={() => navigate('/create-post')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium text-sm transition"
              >
                Create Post
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
