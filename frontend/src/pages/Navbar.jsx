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
    <nav className="flex items-center justify-between h-16 px-24 bg-gray-50 dark:bg-black">
      <div className="flex items-center">
        <div className="mr-4">
          <WhisperLogo />
        </div>

        <div className="hidden lg:block flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 text-sm text-black bg-gray-200 border rounded-lg focus:outline-none"
          />
        </div>
      </div>

      <div className="hidden lg:flex space-x-6">
        <MenuLinks menuLinks={NavigationLinks} />
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <User />
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-black hover:bg-gray-200  px-4 py-2 rounded-md transition"
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

      <div className="lg:hidden">
        <HamburgerButton isOpen={isMobileMenuOpen} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} />
        {isMobileMenuOpen && <MobileMenu menuLinks={NavigationLinks} />}
      </div>
    </nav>
  );
}

export default Navbar;
