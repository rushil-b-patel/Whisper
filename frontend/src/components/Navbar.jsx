import { Link, useNavigate } from 'react-router-dom';
import { WhisperLogo } from './WhisperLogo';
import User from '../ui/User';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="flex items-center justify-between h-16 px-10 dark:bg-[#0e1113] border-b-[1px] dark:border-[#2A3236]">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <WhisperLogo />
        </div>
        <div className="hidden lg:block flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 text-sm text-black bg-gray-200 dark:bg-[#2A3236] border rounded-lg focus:outline-none border-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-6 text-black dark:text-[#eef1f3]">
        <div className="flex space-x-2 md:space-x-4 font-medium lg:text-base">
          <Link
            to="/create-post"
            className="p-2 rounded hover:bg-slate-200 dark:hover:bg-[#2A3236] transition"
          >
            Create
          </Link>
          <Link
            to="/peers"
            className="p-2 rounded hover:bg-slate-200 dark:hover:bg-[#2A3236] transition"
          >
            Peers
          </Link>
        </div>

        {user ? (
          <User />
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="hidden lg:block font-semibold dark:text-[#eef1f3] hover:bg-slate-200 rounded-md py-2 px-4 lg:px-6 lg:py-2 transition whitespace-nowrap"
            >
              Log In
            </button>
            <button
              className="relative inline-block px-4 py-2 font-medium group transition whitespace-nowrap"
              onClick={() => navigate('/signup')}
            >
              <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
              <span className="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-[black]"></span>
              <span className="relative text-black group-hover:text-white">Sign Up</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
