import { Link } from "react-router-dom";


export const MobileMenu = ({ menuLinks }) => {

  return (
    <div className="absolute right-4 top-20 rounded-lg shadow-lg bg-slate-50 dark:bg-gray-900">
      <div className="flex flex-col justify-start m-8 overflow-auto">
        <ul>
          {menuLinks.map((link, index) => (
            <div className="relative group" key={link.name}>
              <li
                className="py-4 font-semibold rounded-lg cursor-pointer lg:px-4"
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
