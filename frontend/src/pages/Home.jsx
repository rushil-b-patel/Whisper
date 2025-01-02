import { useEffect, useState } from "react";
import { usePostService } from "../context/PostContext";
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
        console.log(response);
        setPosts(response.posts);
        setError(null);
      } catch (error) {
        console.error("fetch posts failed", error);
        setError(error.response?.data?.message || "An error occurred while fetching posts");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="dark:bg-[#0e1113] min-h-screen py-8 flex justify-center items-start">
      <div className="w-full max-w-3xl">
        {isLoading ? (
          <div className="min-h-screen flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : (
          <div className="grid gap-1">
            {posts && posts.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No posts available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;