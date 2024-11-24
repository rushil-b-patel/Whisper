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
    <nav className="flex items-center justify-between h-16 px-1 lg:px-24 bg-gray-50 dark:bg-black">
      <div className="flex items-center w-full lg:w-auto">
        <div className="mr-4">
          <WhisperLogo />
        </div>

        <div className="hidden lg:block flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 text-sm text-black dark:text-white bg-gray-200 border rounded-lg dark:bg-gray-900 focus:outline-none border-none"
          />
        </div>
      </div>

      <div className="hidden lg:flex">
        <MenuLinks menuLinks={NavigationLinks} />
      </div>

      <div className="flex space-x-2 lg:space-x-6 items-center">
        {user ? (
          <User />
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-black hover:bg-gray-200 rounded-md py-2 px-4 lg:px-6 lg:py-2 transition whitespace-nowrap"
            >
              Sign In
            </button>
            <button 
              className="relative inline-block px-4 py-2 font-medium group transition whitespace-nowrap"
              onClick={() => navigate("/signup")}
            >
              <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
              <span class="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
              <span class="relative text-black group-hover:text-white">
                Sign Up
              </span>
            </button>
          </>
        )}
      </div>

      <div className="lg:hidden flex right-0 items-center">
        <HamburgerButton
          isOpen={isMobileMenuOpen}
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        />
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 w-full bg-gray-50 dark:bg-black z-50 top-0">
          <MobileMenu menuLinks={NavigationLinks} />
          {/* <div className="flex flex-col items-center space-y-2 p-4">
            {user ? (
              <User />
            ) : (
              <>
                
              </>
            )}
          </div> */}
        </div>
      )}
    </nav>
  );
}

export default Navbar;