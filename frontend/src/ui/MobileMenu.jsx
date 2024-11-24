import { Link } from "react-router-dom";


export const MobileMenu = ({ menuLinks }) => {

  return (
    <div className="absolute w-[calc(100vw-2.5em)] h-[calc(100vh-6em)] top-20 left-5 rounded-lg bg-slate-50 dark:bg-gray-900 shadow-[rgba(0,_0,_0,_0.24)_0px_0px_40px] shadow-slate-400 dark:shadow-slate-700">
      <div className="flex flex-col h-[calc(100%-4em)] m-8 overflow-auto">
        <ul>
          {menuLinks.map((link, index) => (
            <div className="relative group" key={link.name}>
              <li
                className="px-3 py-4 font-semibold rounded-lg cursor-pointer lg:px-4"
                onClick={() => onMenuItemClick(index)}
              >
                <div className="flex justify-between text-gray-800 dark:text-gray-200">
                  <Link to={link.link} className="text-xl font-bold">{link.name}</Link>
                </div>
              </li>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};
