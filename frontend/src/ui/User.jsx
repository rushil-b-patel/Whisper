import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const User = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isMobileDevice = window.innerWidth <= 768;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleItemClick = (action) => {
    action();
    setMenuOpen(false);
  };

  const items = [
    { title: 'Profile', icon: '👤', action: () => navigate('/user/' + user.userName) },
    {
      title: theme === 'light' ? 'Dark Theme' : 'Light Theme',
      icon: theme === 'light' ? '🌙' : '☀️',
      action: toggleTheme,
    },
    { title: 'Settings', icon: '⚙️', action: () => navigate('/settings') },
    { title: 'Logout', icon: '🚪', action: logout },
  ];

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img
          src={`https://api.dicebear.com/5.x/bottts-neutral/svg?seed=${user.userName}`}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
        <span className="hidden lg:block font-mono font-bold dark:text-white">{user.userName}</span>
      </button>

      <div
        className={`absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-[#0e1113] border border-gray-200 dark:border-[#2A3236] rounded-xl shadow-lg transition-all duration-200 ease-in-out transform ${
          menuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <ul className="py-2">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1f2428] transition"
              onClick={() => handleItemClick(item.action)}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {item.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default User;
