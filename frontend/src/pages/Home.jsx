import { useEffect, useState } from 'react'
import { usePostService } from '../context/PostService'

function Home() {

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAllPosts } = usePostService();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try{
        const response = await getAllPosts();
        setPosts(response.posts);
        setError(null);
      }
      catch(error) {
        console.error("fetch posts failed", error);
        setError(error.response?.data?.message || "An error occurred while fetching posts");
      }
      finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className='bg-slate-200 dark:bg-black h-[calc(100vh-4em)] flex justify-center items-center'>
      <div className='bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg'>
        <h1 className='text-2xl font-semibold'>Home</h1>
        <div>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className='text-red-500'>{error}</p>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className='p-4 my-4 bg-slate-100 dark:bg-slate-700 rounded-lg'>
                <h2 className='text-xl font-semibold'>{post.title}</h2>
                <p>{post.description}</p>
              </div>
            ))
          ) : (
            <p>No posts available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home