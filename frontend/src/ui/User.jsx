import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const User = () => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const ms = new Date().getUTCMilliseconds();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const menuRef = useRef(null);
    const isMobileDevice = window.innerWidth <= 768;

    const { user, logout } = useAuth();
  
    useEffect(() => {
      const handleClickOutside = (event) =>{
        if(menuRef.current && !menuRef.current.contains(event.target)){
          setMenuOpen(false);
        }
      }
      if(menuOpen){
        document.addEventListener("mousedown", handleClickOutside);
      }else{
        document.removeEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    useEffect(() =>{
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    }, [theme]);
      
    const onChangeThemeClick = () => {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
    };

    const navigate = useNavigate();
    const onSelect = (path) => {
      navigate(path);
      setMenuOpen(false);
    }

    const items = [
      {
        title: "Profile",
        icon: "👤",
        color: "bg-indigo-300 dark:bg-indigo-800",
        onclick: () => onSelect("/profile"),
      },
      {
        title: theme === "light" ? "Dark theme" : "Light theme",
        icon: theme === "light" ? "🌙" : "☀️",
        color: "bg-teal-300 dark:bg-teal-800",
        onclick: () => onChangeThemeClick(),
      },
      {
        title: "Settings",
        icon: "⚙️",
        color: "bg-fuchsia-300 dark:bg-fuchsia-800",
        onclick: () => {},
      },
      {
        title: "Logout",
        icon: "🚪",
        color: "bg-red-300 dark:bg-red-800",
        onclick: () => logout(),
      },
    ];

  
    return (
      <div 
        className="relative group z-50" 
        onMouseEnter={ ()=> {if(!isMobileDevice) setIsHovering(true)} } 
        onMouseLeave={ ()=> {if(!isMobileDevice) setIsHovering(false)} } 
      >
        <div
          className="flex items-center h-10 rounded-lg cursor-pointer w-fit hover:bg-slate-200 dark:hover:bg-slate-800"
          onClick={()=> {if(isMobileDevice) setMenuOpen((prev) => !prev)} }
        >
          <img
            src={`https://api.dicebear.com/5.x/bottts-neutral/svg?seed=${ms}`}
            className="my-auto mx-2 rounded-full w-7 h-7"
          />
          <p className="hidden lg:block font-mono mr-3 font-bold text-black dark:text-white">{user.userName || user.name}</p>
        </div>
        {(menuOpen || isHovering) && (
          <ul ref={menuRef} className="absolute w-60 p-2 bg-slate-50 dark:bg-[#0e1113] border-[1px] border-gray-200 dark:border-[#2A3236] flex-col -left-[8em] rounded-xl ">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex items-center justify-start h-16 font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
              onClick={item.onclick}
            >
              <div className={`h-10 w-10 ml-5 flex items-center justify-center rounded-lg ${item.color}`}>
                <div className="w-3/5 text-gray-800 h-3/5 dark:text-gray-200">
                  {item.icon}
                </div>
              </div>
              <p className="ml-5 text-gray-600 dark:text-gray-200">
                {item.title}
              </p>
            </li>
          ))}
        </ul>
        )}
      </div>
    );
  };
  
export default User;