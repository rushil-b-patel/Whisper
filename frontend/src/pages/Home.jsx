import { useEffect, useState } from 'react';
import { usePostService } from '../context/PostContext';
import PostCard from '../ui/PostCard';
import { useAuth } from '../context/AuthContext';
import { Fire, Sparkles, Clock } from '../ui/Icons';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, Chat, Inbox, Create, Communities } from '../ui/Icons';

function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('trending');
  const { getAllPosts } = usePostService();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getAllPosts();
        setPosts(response.posts || []);
        setError(null);
      } catch (err) {
        console.error('Fetch posts failed', err);
        setError('Failed to load posts. Try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const getFilteredPosts = () => {
    switch (activeFilter) {
      case 'trending':
        return [...posts].sort((a, b) => b.upVotes - b.downVotes - (a.upVotes - a.downVotes));
      case 'new':
        return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'popular':
        return [...posts].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      default:
        return posts;
    }
  };

  const filters = [
    { id: 'trending', label: 'Trending', icon: <Fire className="w-5 h-5" /> },
    { id: 'new', label: 'New', icon: <Clock className="w-5 h-5" /> },
    { id: 'popular', label: 'Popular', icon: <Sparkles className="w-5 h-5" /> },
  ];

  const userStats = {
    posts: 12,
    upvotes: 243,
    comments: 56,
    karma: 512,
    joinDate: 'Jan 2023',
    recentActivity: [
      { title: 'Started learning React...', time: '2 days ago' },
      { title: "Commented on 'Best practices...'", time: '3 days ago' },
      { title: "Upvoted 'How to improve...'", time: '5 days ago' },
    ],
  };

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-[#0e1113]">
      {showMobileFilter && (
        <div className="fixed top-16 left-0 w-full z-40 bg-white dark:bg-[#131619] border-b dark:border-[#2A2B30] md:hidden shadow">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              className={`w-full flex items-center px-4 py-3 text-left font-mono ${
                activeFilter === id ? 'text-indigo-600' : ''
              }`}
              onClick={() => {
                setActiveFilter(id);
                setShowMobileFilter(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row h-full gap-0 md:gap-6 flex-1">
        <aside className="hidden md:block md:w-64 lg:w-72 h-full overflow-y-auto px-2 py-4">
          <section className="bg-white dark:bg-[#131619] rounded-xl shadow-sm p-4 mb-4">
            <h2 className="font-mono text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Discover
            </h2>
            <ul className="space-y-2">
              {filters.map(({ id, label, icon }) => (
                <li key={id}>
                  <button
                    onClick={() => setActiveFilter(id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeFilter === id
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {icon}
                    <span className="font-mono font-medium">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-[#131619] rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                Departments
              </h2>
              <button className="text-indigo-600 dark:text-indigo-400 text-sm">See All</button>
            </div>
            <ul className="space-y-3">
              {['CSE', 'IT', 'AI & ML', 'Web', 'App'].map((dept, idx) => (
                <li key={dept}>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold flex items-center justify-center text-xs">
                      {dept
                        .split(' ')
                        .map((w) => w[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                        {dept}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{10000 - idx * 2000} members
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="flex-1 max-w-2xl mx-auto px-2 py-4 overflow-y-auto feed-scrollbar-hidden">
          {isLoading ? (
            <div className="h-[40vh] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-medium">{error}</div>
          ) : (
            <div className="space-y-4 pb-20">
              {getFilteredPosts().length > 0 ? (
                getFilteredPosts().map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No posts to show.</p>
              )}
            </div>
          )}
        </main>

        <aside className="hidden md:block md:w-64 lg:w-80 h-full overflow-y-auto px-2 py-4">
          <section className="bg-white dark:bg-[#131619] rounded-xl shadow-sm p-4 mb-4">
            {user ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.userName?.[0] || 'U'}
                  </div>
                  <div className="ml-3">
                    <h2 className="font-mono font-semibold text-gray-900 dark:text-white">
                      {user.userName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Joined {userStats.joinDate}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['Posts', 'Upvotes', 'Comments', 'Karma'].map((label, i) => (
                    <div
                      key={label}
                      className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg text-center"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                      <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                        {Object.values(userStats)[i]}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition">
                    My Posts
                  </button>
                  <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition">
                    Saved
                  </button>
                </div>

                <div className="mt-6">
                  <h3 className="font-mono font-semibold text-gray-900 dark:text-white mb-3">
                    Recent Activity
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {userStats.recentActivity.map((activity, i) => (
                      <li
                        key={i}
                        className="border-b border-dashed dark:border-slate-700 pb-2 last:border-0"
                      >
                        <p className="text-gray-800 dark:text-gray-100 font-medium">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center">
                <h2 className="font-mono text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  Join Whisper
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sign up to share posts and interact.
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition"
                >
                  Sign Up
                </button>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold"
                  >
                    Log In
                  </button>
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#131619] border-t border-gray-200 dark:border-[#2A2B30] flex justify-between items-center px-2 py-1 md:hidden">
        <button onClick={() => navigate('/')} className="flex flex-col items-center flex-1 py-2">
          <HomeIcon />
        </button>
        <button
          onClick={() => navigate('/peers')}
          className="flex flex-col items-center flex-1 py-2"
        >
          <Communities />
        </button>
        <button
          onClick={() => navigate('/create-post')}
          className="flex flex-col items-center flex-1 py-2"
        >
          <Create />
        </button>
        <button
          onClick={() => navigate('/chat')}
          className="flex flex-col items-center flex-1 py-2"
        >
          <Chat />
        </button>
        <button
          onClick={() => navigate('/inbox')}
          className="flex flex-col items-center flex-1 py-2"
        >
          <Inbox />
        </button>
      </nav>
    </div>
  );
}

export default Home;
