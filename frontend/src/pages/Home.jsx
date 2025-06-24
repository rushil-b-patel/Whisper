import { useEffect, useState } from "react";
import { usePostService } from "../context/PostContext";
import PostCard from "../ui/PostCard";
import { useAuth } from "../context/AuthContext";
import { Fire, Sparkles, Users, User, Clock, Bookmark, Settings, Bell } from "../ui/Icons";

function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("trending");
  const { getAllPosts } = usePostService();
  const { user } = useAuth();
  
  const departments = [
    { id: 1, name: "Computer Science", members: 23450 },
    { id: 2, name: "IT", members: 18920 },
    { id: 3, name: "AI & Machine Learning", members: 15600 },
    { id: 4, name: "Web Development", members: 12300 },
    { id: 5, name: "App Development", members: 9870 },
  ];
  
  // Demo user stats
  const userStats = {
    posts: 12,
    upvotes: 243,
    comments: 56,
    karma: 512,
    joinDate: "Jan 2023",
    savedPosts: 23,
    recentActivity: [
      { type: "post", title: "Started learning React...", time: "2 days ago" },
      { type: "comment", title: "Commented on 'Best practices for...'", time: "3 days ago" },
      { type: "upvote", title: "Upvoted 'How to improve...'", time: "5 days ago" },
    ]
  };

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

  const getFilteredPosts = () => {
    if (!posts || posts.length === 0) return [];
    
    switch (activeFilter) {
      case "trending":
        return [...posts].sort((a, b) => (b.upVotes - b.downVotes) - (a.upVotes - a.downVotes));
      case "new":
        return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "popular":
        return [...posts].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      default:
        return posts;
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="dark:bg-[#0e1113] min-h-screen py-4 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="md:w-64 lg:w-72 flex-shrink-0 md:sticky md:top-20 h-auto">
          <div className="bg-white dark:bg-[#131619] rounded-xl p-4 shadow-sm mb-4">
            <h2 className="font-mono text-lg font-bold mb-4 text-black dark:text-white">Discover</h2>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => handleFilterChange("trending")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeFilter === "trending" 
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Fire className="w-5 h-5" />
                  <span className="font-mono font-medium">Trending</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleFilterChange("new")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeFilter === "new" 
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-mono font-medium">New</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleFilterChange("popular")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeFilter === "popular" 
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-mono font-medium">Popular</span>
                </button>
              </li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-[#131619] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-lg font-bold text-black dark:text-white">Departments</h2>
              <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">See All</button>
            </div>
            <ul className="space-y-3">
              {departments.map(department => (
                <li key={department.id}>
                  <button className="w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {department.name.charAt(0)}{department.name.split(' ')[1]?.charAt(0) || ''}
                      </div>
                      <div className="ml-3 text-left">
                        <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                          {department.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {department.members.toLocaleString()} members
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Middle Content - Posts */}
        <div className="flex-grow max-w-xl mx-auto">
          <div className="sticky top-16 z-10 bg-white dark:bg-[#0e1113] py-3 mb-4 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h1 className="font-mono text-2xl font-bold text-black dark:text-white">
                {activeFilter === "trending" && "Trending Posts"}
                {activeFilter === "new" && "New Posts"}
                {activeFilter === "popular" && "Popular Posts"}
              </h1>
            </div>
          </div>
          
          {isLoading ? (
            <div className="min-h-[50vh] flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-[#131619] rounded-xl p-6 shadow-sm">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredPosts().length > 0 ? (
                getFilteredPosts().map((post) => <PostCard key={post._id} post={post} />)
              ) : (
                <div className="bg-white dark:bg-[#131619] rounded-xl p-6 shadow-sm">
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    No posts available
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right Sidebar - User Info */}
        <div className="md:w-64 lg:w-80 flex-shrink-0 md:sticky md:top-20 h-auto">
          {user ? (
            <>
              <div className="bg-white dark:bg-[#131619] rounded-xl p-4 shadow-sm mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                    {user.userName?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3">
                    <h2 className="font-mono text-lg font-bold text-black dark:text-white">{user.userName}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member since {userStats.joinDate}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
                    <p className="font-mono text-lg font-bold text-black dark:text-white">{userStats.posts}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Upvotes</p>
                    <p className="font-mono text-lg font-bold text-black dark:text-white">{userStats.upvotes}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Comments</p>
                    <p className="font-mono text-lg font-bold text-black dark:text-white">{userStats.comments}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Karma</p>
                    <p className="font-mono text-lg font-bold text-black dark:text-white">{userStats.karma}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium">
                    My Posts
                  </button>
                  <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-lg transition-colors text-sm font-medium">
                    Saved
                  </button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#131619] rounded-xl p-4 shadow-sm">
                <h2 className="font-mono text-lg font-bold mb-3 text-black dark:text-white">Recent Activity</h2>
                <ul className="space-y-3">
                  {userStats.recentActivity.map((activity, index) => (
                    <li key={index} className="border-b dark:border-slate-800 pb-2 last:border-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-[#131619] rounded-xl p-4 shadow-sm">
              <div className="text-center py-4">
                <h2 className="font-mono text-lg font-bold mb-2 text-black dark:text-white">Join Whisper</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sign up to join discussions and be part of the community
                </p>
                <button onClick={() => navigate('/signup')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium">
                  Sign Up
                </button>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button onClick={() => navigate('/login')} className="text-indigo-600 dark:text-indigo-400">
                    Log In
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;