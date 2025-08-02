import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Tabs from '../ui/Tabs';
import PostCard from '../ui/PostCard.jsx';
import { useUserService } from '../context/UserContext.jsx';

const TABS = ['Posts', 'Comments', 'Saved', 'Upvoted', 'Downvoted'];

export default function UserProfile() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('Posts');
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTabData, setLoadingTabData] = useState(true);

  const { getUsersData, getUsersTabData } = useUserService();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUser(true);
      const res = await getUsersData(username);
      setUser(res.user);
      setLoadingUser(false);
    };
    fetchUserData();
  }, [username]);

  useEffect(() => {
    const fetchTabData = async () => {
      if (!username) return;
      setLoadingTabData(true);
      const res = await getUsersTabData(username, activeTab);
      setData(res.items);
      setLoadingTabData(false);
    };
    fetchTabData();
  }, [activeTab, username]);

  if (loadingUser) {
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{user.userName}</h1>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6 space-y-4">
        {loadingTabData ? (
          <div className="h-[20vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-gray-500">No {activeTab.toLowerCase()} found.</div>
        ) : activeTab === 'Comments' ? (
          data.map((comment) => (
            <div key={comment._id} className="p-4 bg-gray-100 dark:bg-slate-800 rounded-md shadow-sm">
              <p className="text-gray-800 dark:text-gray-200">{comment.text}</p>
            </div>
          ))
        ) : (
          data.map((post) =>
            post ? (
              <PostCard key={post._id} post={post} />
            ) : (
              <div className="p-4 bg-red-100 text-red-600 rounded">Post not available</div>
            )
          )
        )}
      </div>
    </div>
  );
}
