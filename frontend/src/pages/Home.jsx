import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [departments, setDepartments] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const isPostsFetchingRef = useRef(false);
  const isDepartmentsFetchingRef = useRef(false);
  const isStatsFetchingRef = useRef(false);
  const initialLoadRef = useRef(false);

  const { getAllPosts, getDepartments, getUserStats } = usePostService();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    if (isPostsFetchingRef.current) return;

    isPostsFetchingRef.current = true;
    try {
      const response = await getAllPosts();
      setPosts(response.posts || []);
      setError(null);
    } catch (err) {
      console.error('Fetch posts failed', err);
      setError('Failed to load posts. Try again later.');
    } finally {
      setIsLoading(false);
      isPostsFetchingRef.current = false;
    }
  }, [getAllPosts]);

  const fetchDepartments = useCallback(async () => {
    if (isDepartmentsFetchingRef.current) return;

    isDepartmentsFetchingRef.current = true;
    try {
      setDepartmentsLoading(true);
      setDepartmentsError(null);
      const response = await getDepartments();
      if (response.departments && response.departments.length > 0) {
        setDepartments(response.departments);
      } else {
        setDepartments([]);
        setDepartmentsError('No departments found');
      }
    } catch (err) {
      console.error('Fetch departments failed', err);
      setDepartmentsError('Failed to load departments');
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
      isDepartmentsFetchingRef.current = false;
    }
  }, [getDepartments]);

  const fetchUserStats = useCallback(async () => {
    if (isStatsFetchingRef.current) return;

    if (!user) {
      setStatsLoading(false);
      setUserStats(null);
      setStatsError(null);
      return;
    }

    isStatsFetchingRef.current = true;
    try {
      setStatsLoading(true);
      setStatsError(null);
      const token = localStorage.getItem('token');
      if (token) {
        const response = await getUserStats(token);
        if (response.stats) {
          setUserStats(response.stats);
        } else {
          setUserStats(null);
          setStatsError('No user statistics available');
        }
      } else {
        setStatsError('Authentication required');
      }
    } catch (err) {
      console.error('Fetch user stats failed', err);
      setStatsError('Failed to load user statistics');
      setUserStats(null);
    } finally {
      setStatsLoading(false);
      isStatsFetchingRef.current = false;
    }
  }, [user, getUserStats]);

  useEffect(() => {
    if (initialLoadRef.current) return;

    initialLoadRef.current = true;
    fetchPosts();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!initialLoadRef.current) return;

    fetchUserStats();
  }, [user]);

  const filteredPosts = useCallback(() => {
    if (!posts.length) return [];

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
  }, [posts, activeFilter]);

  const filters = [
    { id: 'trending', label: 'Trending', icon: <Fire className="w-5 h-5" /> },
    { id: 'new', label: 'New', icon: <Clock className="w-5 h-5" /> },
    { id: 'popular', label: 'Popular', icon: <Sparkles className="w-5 h-5" /> },
  ];

  const handleFilterChange = useCallback((filterId) => {
    setActiveFilter(filterId);
    setShowMobileFilter(false);
  }, []);

  const handleRefresh = useCallback(() => {
    isPostsFetchingRef.current = false;
    isDepartmentsFetchingRef.current = false;
    isStatsFetchingRef.current = false;

    fetchPosts();
    fetchDepartments();
    if (user) {
      fetchUserStats();
    }
  }, [fetchPosts, fetchDepartments, fetchUserStats, user]);

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-[#0e1113]">
      {showMobileFilter && (
        <div className="fixed top-16 left-0 w-full z-40 bg-white dark:bg-[#131619] border-b border-gray-200 dark:border-[#2A2B30] md:hidden shadow-sm">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              className={`w-full flex items-center px-4 py-3 text-left font-mono transition-colors ${
                activeFilter === id
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
              onClick={() => handleFilterChange(id)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row h-full gap-0 md:gap-6 flex-1">
        <aside className="hidden md:block md:w-64 lg:w-72 h-full overflow-y-auto px-2 py-4">
          <section className="bg-white dark:bg-[#131619] rounded-xl shadow-sm border border-gray-200 dark:border-[#2A2B30] p-4 mb-4">
            <h2 className="font-mono text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Discover
            </h2>
            <ul className="space-y-2">
              {filters.map(({ id, label, icon }) => (
                <li key={id}>
                  <button
                    onClick={() => handleFilterChange(id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeFilter === id
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {icon}
                    <span className="font-mono font-medium">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-[#131619] rounded-xl shadow-sm border border-gray-200 dark:border-[#2A2B30] p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                Departments
              </h2>
              {!departmentsLoading && departments.length > 5 && (
                <button className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white hover:underline transition-colors">
                  See All
                </button>
              )}
            </div>

            {departmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : departmentsError ? (
              <div className="text-center py-6">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">
                  {departmentsError}
                </p>
                <button
                  onClick={fetchDepartments}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  No departments available
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {departments.slice(0, 5).map((dept) => (
                  <li key={dept.name}>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white font-bold flex items-center justify-center text-xs">
                        {dept.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                          {dept.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {dept.memberCount} members
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <main className="flex-1 max-w-2xl mx-auto px-2 py-4 overflow-y-auto feed-scrollbar-hidden">
          {isLoading ? (
            <div className="h-[40vh] flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  Loading posts...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-mono font-semibold text-gray-900 dark:text-white mb-2">
                Unable to load posts
              </h3>
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
              {filteredPosts().length > 0 ? (
                filteredPosts().map((post) => <PostCard key={post._id} post={post} />)
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-mono font-semibold text-gray-900 dark:text-white mb-2">
                    No posts available
                  </h3>
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

        <aside className="hidden md:block md:w-64 lg:w-80 h-full overflow-y-auto px-2 py-4">
          <section className="bg-white dark:bg-[#131619] rounded-xl shadow-sm border border-gray-200 dark:border-[#2A2B30] p-4 mb-4">
            {user ? (
              statsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      Loading stats...
                    </p>
                  </div>
                </div>
              ) : statsError ? (
                <div className="text-center py-6">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-mono font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome, {user.userName}!
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-3">
                    {statsError}
                  </p>
                  <button
                    onClick={fetchUserStats}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline transition-colors"
                  >
                    Retry loading stats
                  </button>
                </div>
              ) : userStats ? (
                <>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-bold text-lg">
                      {user.userName?.[0]?.toUpperCase() || 'U'}
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
                    {[
                      { label: 'Posts', value: userStats.posts || 0 },
                      { label: 'Upvotes', value: userStats.upvotes || 0 },
                      { label: 'Comments', value: userStats.comments || 0 },
                      { label: 'Karma', value: userStats.karma || 0 },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg text-center transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/user-posts')}
                      className="flex-1 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition"
                    >
                      My Posts
                    </button>
                    <button
                      onClick={() => navigate('/saved-posts')}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition border border-gray-200 dark:border-gray-700"
                    >
                      Saved
                    </button>
                  </div>

                  {userStats.recentActivity && userStats.recentActivity.length > 0 ? (
                    <div className="mt-6">
                      <h3 className="font-mono font-semibold text-gray-900 dark:text-white mb-3">
                        Recent Activity
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {userStats.recentActivity.map((activity, i) => (
                          <li
                            key={i}
                            className="border-b border-dashed border-gray-300 dark:border-slate-700 pb-2 last:border-0"
                          >
                            <p className="text-gray-800 dark:text-gray-100 font-medium">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-6 text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        No recent activity
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Start posting and commenting to see activity here
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-mono font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome, {user.userName}!
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    Your statistics will appear here once you start engaging with the community.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center">
                <h2 className="font-mono text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  Join Whisper
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sign up to share posts and interact with the community.
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium text-sm transition mb-3"
                >
                  Sign Up
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-600 dark:text-gray-400 font-semibold hover:text-gray-900 dark:hover:text-white hover:underline transition-colors"
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
