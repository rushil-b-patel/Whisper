import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const departmentOptions = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'AI & Data Science',
  'Other...',
];

function Profile() {
  const { user, updateUserData, isLoading } = useAuth();
  const [userName, setUserName] = useState(user.userName || user?.name || '');
  const [department, setDepartment] = useState(user.department || '');
  const [bio, setBio] = useState(user.bio || '');
  const [customDept, setCustomDept] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    const finalDepartment = department === 'Other...' ? customDept : department;
    await updateUserData({ userName, department: finalDepartment, bio });
  };

  return (
    <div className="min-h-[calc(100vh-4em)] px-4 sm:px-6 py-10 flex justify-center bg-white dark:bg-[#0e1113]">
      <div className="w-full max-w-2xl border border-gray-200 dark:border-slate-800 rounded-lg px-6 py-8 sm:px-10 sm:py-12 transition-all duration-300 shadow-sm">
        <div className="border-l-4 border-black pl-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-mono text-black dark:text-white">
            Edit Profile
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-10">
          <div>
            <label className="block font-semibold mb-2 font-mono text-black dark:text-white">
              Username
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 font-mono transition duration-300"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 font-mono text-black dark:text-white">
              About You
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself"
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 font-mono transition duration-300 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 font-mono text-black dark:text-white">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-transparent border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 font-mono transition duration-300"
            >
              <option value="" disabled>
                Select Department
              </option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {department === 'Other...' && (
              <input
                type="text"
                value={customDept}
                onChange={(e) => setCustomDept(e.target.value)}
                placeholder="Enter your department"
                className="mt-4 w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 font-mono transition duration-300 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-semibold font-mono bg-black text-white hover:bg-white hover:text-black border border-black transition-all duration-300 rounded"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-mono mt-2">
            Your email is encrypted and stored securely.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Profile;
