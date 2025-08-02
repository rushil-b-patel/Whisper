import { Link, useNavigate } from 'react-router-dom';
import { WhisperLogo } from './WhisperLogo';
import User from '../ui/User';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { Search } from '../ui/Icons';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  return (
    <nav className="flex items-center justify-between h-16 px-4 md:px-10 dark:bg-[#0e1113] bg-white border-b dark:border-[#2A3236] border-gray-200 relative">
      <div className="flex items-center space-x-4">
        <WhisperLogo />
        <div className="hidden lg:block w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-[#2A3236] dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        <div ref={searchRef} className="relative block md:hidden">
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#2A3236] transition"
              aria-label="Search"
            >
              <Search />
            </button>
          )}
          {showSearch && (
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="right-0 w-48 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-[#2A3236] dark:text-white border border-gray-300 dark:border-slate-700 transition"
            />
          )}
        </div>

        <div className="hidden md:flex space-x-2">
          <Link
            to="/create-post"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:text-[#eef1f3] dark:hover:bg-[#2A3236] transition"
          >
            Create
          </Link>
          <Link
            to="/departments"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:text-[#eef1f3] dark:hover:bg-[#2A3236] transition"
          >
            Departments
          </Link>
        </div>

        {user ? (
          <User />
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/login')}
              className="hidden lg:block text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#2A3236] px-4 py-2 rounded transition"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="relative inline-block px-4 py-2 font-medium group"
            >
              <span className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition duration-200 ease-in-out"></span>
              <span className="absolute inset-0 bg-white border-2 border-black group-hover:bg-black transition duration-200 ease-in-out"></span>
              <span className="relative text-black group-hover:text-white transition duration-200 ease-in-out">
                Sign Up
              </span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
