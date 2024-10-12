import { useEffect, useState } from "react";
import { usePostService } from "../context/PostService";
import PostCard from "../ui/PostCard";

function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAllPosts } = usePostService();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getAllPosts();
        setPosts(response.posts);
        setError(null);
      } catch (error) {
        console.error("fetch posts failed", error);
        setError(
          error.response?.data?.message ||
            "An error occurred while fetching posts"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className='bg-white dark:bg-black min-h-[calc(100vh-4em)] flex justify-center items-start py-8'>
    <div className='w-1/2 max-w-2xl'>
      <h1 className='text-4xl font-bold text-center text-gray-800 dark:text-white mb-8'>create post section</h1>
      {isLoading ? (
        <p>Loading posts...</p>
      ) : error ? (
        <p className='text-red-500'>{error}</p>
      ) : (
        <div className='grid grid-cols-1'>
          {posts && posts.length > 0 ? (
            posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <p>No posts available</p>
          )}
        </div>
      )}
    </div>
  </div>
  );
}

export default Home;
