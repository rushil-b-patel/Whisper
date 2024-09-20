import React, { useEffect, useState } from 'react';
import {HamburgerButton} from '../components/HamburgerButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { WhisperLogo } from '../components/WhisperLogo';
import { MenuLinks } from '../components/MenuLinks';
import { NavigationLinks } from '../ui/NavigationLinks';
import User from '../ui/User';
import { MobileMenu } from '../ui/MobileMenu';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUser, setIsUser] = useState(false);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className='flex items-center h-16 px-3 m-0 md:px-4  bg-gray-50 dark:bg-black'>
      <div className="flex items-center justify-between w-full md:mx-4 lg:mx-8 2xl:w-[80em] 2xl:mx-auto">
        <div className="flex items-center justify-center">
          <div className='md:hidden'>
            <HamburgerButton isOpen={isMobileMenuOpen} onClick={()=> setMobileMenuOpen(!isMobileMenuOpen) } />
          </div>
          <div className='hidden md:block'>
            <WhisperLogo />
          </div>
          <div className="relative hidden ml-4 text-gray-600 top-[1px] md:block">
              <MenuLinks menuLinks={NavigationLinks} />
          </div>
        </div>
        <div className="absolute block transform -translate-x-1/2 md:hidden left-1/2">
            <WhisperLogo />
          </div>
          <div className="flex items-center justify-center gap-4">
            {/* <div className="hidden md:block">
              <KbarInput />
            </div> */}
            {
              isUser ? <User /> : 
              <>
                <button onClick={()=>navigate('/login')} className="">Sign In</button>
                <button onClick={()=>navigate('/signup')} className="">Sign Up</button>
              </>
            } 
          </div>
      </div>
      <div className="md:hidden">
          {isMobileMenuOpen && <MobileMenu menuLinks={NavigationLinks} />}
        </div>
    </nav>
  )
}

export default Navbar