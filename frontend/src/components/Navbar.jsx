import { Link, useNavigate } from 'react-router-dom';
import { WhisperLogo } from './WhisperLogo';
import User from '../ui/User';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="flex items-center justify-between h-16 px-6 md:px-10 dark:bg-[#0e1113] bg-white border-b dark:border-[#2A3236] border-gray-200">
      <div className="flex items-center space-x-4">
        <WhisperLogo />
        <div className="hidden lg:block w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-[#2A3236] dark:text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        <Link
          to="/create-post"
          className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:text-[#eef1f3] dark:hover:bg-[#2A3236] transition"
        >
          Create
        </Link>
        <Link
          to="/peers"
          className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:text-[#eef1f3] dark:hover:bg-[#2A3236] transition"
        >
          Peers
        </Link>

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
