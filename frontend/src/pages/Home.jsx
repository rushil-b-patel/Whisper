import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { usePostService } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { Fire, Sparkles, Clock } from '../ui/Icons';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, Chat, Inbox, Create, Communities } from '../ui/Icons';
import LeftLayout from './LeftLayout';
import RightLayout from './RightLayout';
import Feed from './Feed';

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

  const _fetchDepartments = useCallback(async () => {
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
    if (initialLoadRef.current) {
      if (user) fetchUserStats();
      return;
    }

    initialLoadRef.current = true;
    fetchPosts();
    _fetchDepartments();

    if (user) fetchUserStats();
  }, [user]);

  const filteredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    const safeUpvotes = (p) => Number(p.upVotes || 0);
    const safeDownvotes = (p) => Number(p.downVotes || 0);
    const voteScore = (p) => safeUpvotes(p) - safeDownvotes(p);

    switch (activeFilter) {
      case 'trending':
        return [...posts].sort((a, b) => voteScore(b) - voteScore(a));
      case 'new':
        return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'popular':
        return [...posts].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      default:
        return posts;
    }
  }, [posts, activeFilter]);

  const filters = useMemo(
    () => [
      { id: 'trending', label: 'Trending', icon: <Fire className="w-5 h-5" /> },
      { id: 'new', label: 'New', icon: <Clock className="w-5 h-5" /> },
      { id: 'popular', label: 'Popular', icon: <Sparkles className="w-5 h-5" /> },
    ],
    []
  );

  const handleFilterChange = useCallback((filterId) => {
    setActiveFilter(filterId);
    setShowMobileFilter(false);
  }, []);

  const handleRefresh = useCallback(() => {
    if (
      isPostsFetchingRef.current ||
      isDepartmentsFetchingRef.current ||
      isStatsFetchingRef.current
    )
      return;

    isPostsFetchingRef.current = false;
    isDepartmentsFetchingRef.current = false;
    isStatsFetchingRef.current = false;

    fetchPosts();
    _fetchDepartments();
    if (user) fetchUserStats();
  }, [fetchPosts, _fetchDepartments, fetchUserStats, user]);

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
        <LeftLayout
          activeFilter={activeFilter}
          handleFilterChange={handleFilterChange}
          filters={filters}
          departments={departments}
          departmentsLoading={departmentsLoading}
          departmentsError={departmentsError}
          fetchDepartments={_fetchDepartments}
        />

        <Feed
          isLoading={isLoading}
          error={error}
          filteredPosts={filteredPosts}
          fetchPosts={fetchPosts}
        />

        <RightLayout
          user={user}
          statsLoading={statsLoading}
          statsError={statsError}
          userStats={userStats}
          fetchUserStats={fetchUserStats}
        />
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
