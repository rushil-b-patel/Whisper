import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePostService } from '../context/PostContext';
import toast from 'react-hot-toast';
import PostCard from '../ui/PostCard';

function Tag() {
  const { name } = useParams();
  const { getPostsByTag } = usePostService();
  const [posts, setPosts] = useState([]);
  const [tag, setTag] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await getPostsByTag(name);
        setPosts(res.posts);
        setTag(res.tag);
      } catch (err) {
        toast.error('Failed to fetch posts for this tag');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [name]);

  if (isLoading) return <div className="flex h-[90vh] justify-center items-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Posts tagged with <span className="text-indigo-600">#{tag?.name}</span>
      </h1>
      {posts?.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No posts for this tag yet.</p>
      )}
    </div>
  );
}

export default Tag;
