
import { Bar3Icon, XMarkIcon } from '../ui/Icons';

export const HamburgerButton = ({ isOpen, onClick }) => {
    return(
        <button 
        className="flex items-center justify-center w-10 h-10 p-2 font-semibold text-gray-800 rounded-lg cursor-pointer whitespace-nowrap dark:text-gray-200 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
        onClick={onClick} >
            {isOpen ? <XMarkIcon /> : <Bar3Icon />}
        </button>
    )
}

