import { Link } from "react-router-dom"

export const WhisperLogo = () => {
    return(
        <Link to='/' className="flex items-center space-x-2">
            <img className="h-10 w-max" src="https://w7.pngwing.com/pngs/580/108/png-transparent-protect-america-texas-security-alarms-systems-home-security-adt-security-services-security-alarm-miscellaneous-text-triangle-thumbnail.png">
            </img>
            <span className="hidden lg:block self-center text-xl font-bold text-gray-800 whitespace-nowrap dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400">
                Whisper
            </span>
        </Link>
    )
}