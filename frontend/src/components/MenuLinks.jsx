import { Link } from "react-router-dom";

export const MenuLinks = ({ menuLinks }) => {
  return (
    <ul className="flex px-1 lg:px-4">
      {menuLinks.map((link) => (
        <li key={link.name} className="p-2 font-semibold rounded-lg lg:px-4">
          <Link
            to={link.link}
            className="text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md p-2"
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};
