import { useNavigate } from 'react-router-dom';

export default function RightLayout({
  user,
  statsLoading,
  statsError,
  userStats,
  fetchUserStats,
}) {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:block md:w-64 lg:w-80 h-full overflow-y-auto px-2 py-4">
      <section className="bg-white dark:bg-[#131619] rounded-xl shadow-sm border border-gray-200 dark:border-[#2A2B30] p-4 mb-4">
        {user ? (
          statsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            </div>
          ) : statsError ? (
            <div className="text-center py-6">
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

              {userStats.recentActivity?.length > 0 ? (
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
                        <p className="text-gray-800 dark:text-gray-100 font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
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
          ) : null
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
  );
}
