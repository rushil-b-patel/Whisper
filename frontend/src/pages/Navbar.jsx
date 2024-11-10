import React, { useEffect, useState } from 'react';
import { HamburgerButton } from '../components/HamburgerButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { WhisperLogo } from '../components/WhisperLogo';
import { MenuLinks } from '../components/MenuLinks';
import { NavigationLinks } from '../ui/NavigationLinks';
import User from '../ui/User';
import { MobileMenu } from '../ui/MobileMenu';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="flex items-center justify-between h-16 px-4 lg:px-24 bg-gray-50 dark:bg-black">
      {/* Logo and Search */}
      <div className="flex items-center w-full lg:w-auto">
        <div className="mr-4">
          <WhisperLogo />
        </div>

        {/* Search bar: Hidden on mobile, visible on large screens */}
        <div className="hidden lg:block flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 text-sm text-black dark:text-white bg-gray-200 border rounded-lg dark:bg-gray-900 focus:outline-none border-none"
          />
        </div>
      </div>

      {/* Links and User Profile: Hidden on mobile */}
      <div className="hidden lg:flex space-x-6 items-center">
        <MenuLinks menuLinks={NavigationLinks} />
        {user ? (
          <User />
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-black dark:text-white hover:bg-gray-200 px-4 py-2 rounded-md transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm py-1 px-4 lg:px-4 lg:py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden flex items-center">
        <HamburgerButton isOpen={isMobileMenuOpen} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} />
      </div>

      {/* Mobile Menu: Visible only when toggled on mobile */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-50 dark:bg-black z-50">
          <MobileMenu menuLinks={NavigationLinks} />
          <div className="flex flex-col items-center space-y-2 p-4">
            {user ? (
              <User />
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full font-semibold text-black dark:text-white hover:bg-gray-200 px-4 py-2 rounded-md transition text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full text-sm py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition text-center"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;