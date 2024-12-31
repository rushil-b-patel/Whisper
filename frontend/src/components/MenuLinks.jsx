import { Link } from "react-router-dom";

export const MenuLinks = ({ menuLinks }) => {
  return (
    <ul className="flex px-1 lg:px-4">
      {menuLinks.map((link) => (
        <li key={link.name} className="p-2 font-bold rounded-lg lg:px-4">
          <Link
            to={link.link}
            className="text-[#eef1f3] hover:bg-[#2A3236] rounded-md p-2"
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};
