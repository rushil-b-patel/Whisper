import { useEffect, useState } from 'react';
import { Combobox } from '@headlessui/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usePostService } from '../context/PostContext';

function Profile() {
  const { user, updateUserData, isLoading } = useAuth();
  const { getDepartments, saveDepartment } = usePostService();
  const [userName, setUserName] = useState(user.userName || user?.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [department, setDepartment] = useState(user.department || '');
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState('');

  const filtered = query === ''
    ? departments
    : departments.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const _fetchDepartments = async () => {
      const data = await getDepartments(token);
      setDepartments(data.departments || []);
    };
    _fetchDepartments();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    let finalDept = department;

    const exists = departments.find((d) => d.name.toLowerCase() === department.toLowerCase());

    if (!exists && department) {
      try {
        const res = await saveDepartment(localStorage.getItem('token'), department);
        setDepartments((prev) => [...prev, res.data.department]);
      } catch (err) {
        console.error('Failed to add department:', err);
      }
    }

    await updateUserData({ userName, department: finalDept, bio });
  };

  return (
    <div className="min-h-[calc(100vh-4em)] px-4 sm:px-6 py-10 flex justify-center bg-white dark:bg-[#0e1113]">
      <div className="w-full max-w-2xl border border-gray-200 dark:border-slate-800 rounded-lg px-6 py-8 sm:px-10 sm:py-12 transition-all duration-300 shadow-sm">
        <div className="border-l-4 border-black pl-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-mono text-black dark:text-white">Edit Profile</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-10">
          <div>
            <label className="block font-semibold mb-2 font-mono text-black dark:text-white">Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 font-mono text-black dark:text-white">About You</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself"
              rows={2}
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 font-mono resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 font-mono text-black dark:text-white">Department</label>
            <Combobox value={department} onChange={setDepartment}>
              <div className="relative">
                <Combobox.Input
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setDepartment(e.target.value);
                  }}
                  className="w-full border-b border-gray-300 dark:border-gray-700 p-2 bg-transparent text-black dark:text-white font-mono"
                  placeholder="Select or type your department"
                />
                {filtered.length > 0 && (
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 text-black dark:text-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
                    {filtered.map((dept) => (
                      <Combobox.Option
                        key={dept._id}
                        value={dept.name}
                        className={({ active }) =>
                          `cursor-pointer select-none px-4 py-2 ${
                            active ? 'bg-indigo-500 text-white' : ''
                          }`
                        }
                      >
                        {dept.name}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </div>
            </Combobox>
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
