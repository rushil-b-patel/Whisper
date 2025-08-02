import { useEffect, useState } from 'react';
import { usePostService } from '../context/PostContext';
import PostCard from '../ui/PostCard';

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptPosts, setDeptPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getPostsByDepartment, getDepartments } = usePostService();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await getDepartments();
        setDepartments(res.departments);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };

    fetchDepartments();
  }, []);

  const fetchPosts = async (deptName) => {
    try {
      setLoading(true);
      const res = await getPostsByDepartment(deptName);
      setDeptPosts(res.posts);
      setSelectedDept(deptName);
    } catch (err) {
      console.error('Failed to fetch posts for department', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1113] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold font-mono text-center mb-10 text-gray-900 dark:text-white">
          Explore Departments
        </h1>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 mb-12">
          {departments.map((dept) => (
            <button
              key={dept.name}
              onClick={() => fetchPosts(dept.name)}
              className={`rounded-2xl border dark:border-[#2A2B30] px-4 py-6 shadow-sm hover:shadow-md transition-colors duration-200 font-mono text-sm text-center ${
                selectedDept === dept.name
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-white dark:bg-[#1a1c1f] text-gray-900 dark:text-white'
              }`}
            >
              <h3 className="text-lg font-bold">{dept.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{dept.postCount} posts</p>
            </button>
          ))}
        </div>

        {selectedDept && (
          <div className="bg-white dark:bg-[#1a1c1f] p-6 rounded-2xl border border-gray-200 dark:border-[#2A2B30] shadow-lg">
            <h2 className="text-xl font-bold mb-4 font-mono text-gray-800 dark:text-white">
              Posts from <span className="underline">{selectedDept}</span>
            </h2>

            {loading ? (
              <div className="text-center text-gray-500 font-mono">Loading posts...</div>
            ) : deptPosts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">No posts found.</p>
            ) : (
              <div className="space-y-4">
                {deptPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
