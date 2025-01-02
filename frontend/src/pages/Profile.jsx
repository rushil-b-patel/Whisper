import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {

  const { user, updateUserData, isLoading } = useAuth();
  const [email, setEmail] = useState(user.email || "");
  const [userName, setUserName] = useState(user.userName || user?.name || "");
  const [department, setDepartment] = useState(user.department || "");
  const [bio, setBio] = useState(user.bio || "");


  const handleSave = async (e) => {
    e.preventDefault();
    await updateUserData({ userName, department, bio });
  };

  return (
    <div className='h-[calc(100vh-4em)] bg-white dark:bg-[#0e1113] justify-center items-center text-black dark:text-[#F2F2F2]'>
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="space-y-5">
        <div>
          <label className="block font-semibold mb-2">Email</label>
          <input
            type="text"
            value={email}
            disabled
            className="w-full p-3 dark:bg-[#2A3236] dark:border-none border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Username</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-3 dark:bg-[#2A3236] dark:border-none border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Bio</label>
          <textarea
            placeholder="Tell other users about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 dark:bg-[#2A3236] dark:border-none border border-gray-300 rounded-lg resize-none h-24"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-3 dark:bg-[#2A3236] dark:border-none border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full font-semibold py-3 rounded-lg text-white hover:text-black dark:hover:text-white dark:hover:bg-black bg-black dark:bg-[#2A3236] hover:bg-white border-[2px] border-transparent hover:border-black transition animation duration-500 ease-in-out"
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
