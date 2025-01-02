import { Link } from "react-router-dom"

export const WhisperLogo = () => {
    return(
        <Link to='/' className="flex items-center space-x-2">
            {/* <img className="h-10 w-max" src="https://previews.123rf.com/images/jetapura9974/jetapura99742301/jetapura9974230100018/203599718-a-silhouette-style-be-quite-silent-silence-finger-lips-icon-symbol-sign-logo-graphic-design-art.jpg" /> */}
            <span className="hidden lg:block self-center text-xl font-bold text-black dark:text-[#eef1f3] whitespace-nowrap hover:text-[#0e1113] dark:hover:text-gray-300">
                Whisper
            </span>
        </Link>
    )
}