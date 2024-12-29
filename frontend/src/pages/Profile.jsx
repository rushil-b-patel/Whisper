import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {

  const {user} = useAuth();

  const [email, setEmail] = useState(user?.email || "");
  const [userName, setUserName] = useState(user?.userName || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [bio, setBio] = useState(user?.bio || "");

  const { updateUserData, isLoading } = useAuth();

  const handleSave = async (e) => {
    e.preventDefault();
    await updateUserData({ userName, department, bio });
  };

  return (
    <div className='bg-white dark:bg-black justify-center items-center text-black dark:text-[#F2F2F2]'>
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Email</label>
          <input
            type="text"
            value={email}
            disabled
            className="w-full p-3 dark:bg-slate-700 dark:border-none border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Username</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-3 dark:bg-slate-700 dark:border-none border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Bio</label>
          <textarea
            placeholder="Tell other users about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 dark:bg-slate-700 dark:border-none border border-gray-300 rounded-lg resize-none h-24"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-3 dark:bg-slate-700 dark:border-none border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-black dark:bg-gray-100 text-white dark:text-black font-semibold py-3 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-200 transition"
        >
          {
            isLoading ? "Saving..." : "Save"
          }
        </button>
        <p className="text-sm text-center text-gray-500 mt-4">
          Only your username will be visible in your company's private channel.
        </p>
      </div>
    </div>
    </div>
  );
}

export default Profile;
