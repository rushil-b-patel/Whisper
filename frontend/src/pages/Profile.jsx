import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const departmentOptions = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "AI & Data Science",
  "Other..."
];

function Profile() {
  const { user, updateUserData, isLoading } = useAuth();
  const [userName, setUserName] = useState(user.userName || user?.name || "");
  const [department, setDepartment] = useState(user.department || "");
  const [bio, setBio] = useState(user.bio || "");
  const [customDept, setCustomDept] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    const finalDepartment = department === "Other..." ? customDept : department;
    await updateUserData({ userName, department: finalDepartment, bio });
  };

  return (
    <div className='min-h-[calc(100vh-4em)] bg-white dark:bg-[#0e1113] flex justify-center items-start pt-10 text-black dark:text-[#F2F2F2]'>
      <div className="w-full max-w-2xl p-6 font-sans bg-white dark:bg-[#1a1c1f] rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-center font-mono">Your Profile</h1>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2 font-mono">Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-3 dark:bg-[#2A3236] dark:border-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 font-mono">About Description</label>
            <textarea
              placeholder="Tell other users about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 dark:bg-[#2A3236] dark:border-none border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 font-mono">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-3 dark:bg-[#2A3236] dark:border-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select Department</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {department === "Other..." && (
              <input
                type="text"
                placeholder="Enter your department"
                value={customDept}
                onChange={(e) => setCustomDept(e.target.value)}
                className="mt-2 w-full p-3 dark:bg-[#2A3236] dark:border-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full font-semibold py-3 rounded-lg text-white hover:text-black dark:hover:text-white dark:hover:bg-black bg-black dark:bg-[#2A3236] hover:bg-white border-[2px] border-transparent hover:border-black transition duration-500 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
          <p className="text-sm text-center text-gray-500 mt-4 font-mono">
            Your email is saved with encryption.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Profile;
