import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {

  const {user} = useAuth();

  const [userName, setUserName] = useState(user?.userName || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [location, setLocation] = useState(user?.location || "");
  const [previousSchool, setPreviousSchool] = useState(user?.previousCompany || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (
      userName !== user?.userName ||
      department !== user?.department ||
      location !== user?.location ||
      previousSchool !== user?.previousCompany ||
      bio !== user?.bio
    ) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [userName, department, location, previousSchool, bio, user]);

  const handleSave = () => {
    console.log({ userName, department, location, previousSchool, bio });
    setIsModified(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="space-y-6">
        <div>
          <label className="block text-black font-semibold mb-2">Username</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-black font-semibold mb-2">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-black font-semibold mb-2">Location</label>
          <input
            type="text"
            placeholder="E.g. Anand, Gujarat, India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-black font-semibold mb-2">Previous School/College</label>
          <input
            type="text"
            placeholder="E.g. Nirma, RPTP etc."
            value={previousSchool}
            onChange={(e) => setPreviousSchool(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-black font-semibold mb-2">Bio</label>
          <textarea
            placeholder="Tell other users about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-900 transition"
        >
          Save All
        </button>
        <p className="text-sm text-center text-gray-500 mt-4">
          Only your username will be visible in your company's private channel.
        </p>
      </div>
    </div>
  );
}

export default Profile;
