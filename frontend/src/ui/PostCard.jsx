import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Comment, ChevronDown, ChevronUp } from './Icons';
import VoteBar from '../components/voteBar';

function PostCard({ post }) {
  const navigate = useNavigate();

  if (!post) return (
    <div className="bg-white border-2 border-red-500 p-3 rounded-lg text-red-500 font-mono shadow-sm dark:bg-slate-900">
      Error: Data is missing...!
    </div>
  );

  const handleRedirect = useCallback(() => {
    if (post._id) {
      console.log("Redirecting to post detail page with ID:", post._id);
      navigate(`/post/${post._id}`);
    }
  }, [post._id, navigate]);
  
  return (
    <div className="relative bg-white w-full sm:max-w-xl mx-auto p-4 sm:p-6 cursor-pointer mb-4 sm:mb-6 rounded-xl transform transition-all duration-300 border border-slate-200 hover:border-indigo-500/30hover:shadow-lg sm:hover:shadow-xl hover:shadow-indigo-100 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500/30 dark:hover:shadow-indigo-900/20"
      onClick={handleRedirect}
    >
      <div className="flex items-start sm:items-center mb-3 sm:mb-5 relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-200 rounded-full blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300 dark:bg-indigo-500" />
          <img
            src={post.avatar || "/api/placeholder/40/40"}
            alt={post.author}
            className="w-5 h-5 sm:w-8 sm:h-8 rounded-full object-cover relative z-10 ring-2 ring-slate-100 ring-offset-1 sm:ring-offset-2 group-hover:ring-indigo-200 transition-all duration-300 dark:ring-slate-800 dark:group-hover:ring-indigo-500"
          />
        </div>
        <div className="ml-3 sm:ml-4 max-w-[80%]">
          <h2 className="font-mono text-base sm:text-md font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent truncate dark:from-indigo-400 dark:to-violet-400">
            {post.user?.userName || "Unknown User"}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-black dark:text-white truncate">
            {post.user?.department || "Unknown department"}
          </p>
        </div>
      </div>

      <div className="relative mb-2 sm:mb-3 pl-2 sm:pl-3">
        <div className="absolute left-0 top-0 h-full w-0.5 sm:w-1 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full opacity-30" />
        <p className="font-mono text-lg sm:text-xl font-bold text-black dark:text-white line-clamp-2 sm:line-clamp-none">
          {post.title}
        </p>
      </div>

      <p className="font-mono text-sm sm:text-base text-black mb-3 sm:mb-5 leading-relaxed pl-2 sm:pl-3 dark:text-white line-clamp-3 sm:line-clamp-none">
        {post.description}
      </p>

      {post.image && (
        <div className="relative mb-3 sm:mb-5 p-0.5 sm:p-1 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-indigo-900/20 dark:to-violet-900/20" />
          <img
            src={post.image}
            alt={post.title}
            className="w-full object-cover rounded-lg max-h-36 sm:max-h-64 relative z-10"
          />
        </div>
      )}

      <div className="flex justify-between items-center pl-2 sm:pl-3">
        <div className="flex items-center space-x-4 sm:space-x-6">
            <VoteBar id={post._id} />
          <button className="group flex items-center border border-gray-200 rounded-xl p-1 px-3 gap-3 text-black dark:text-white dark:border-none dark:bg-slate-700 hover:bg-slate-200  transition-colors">
            <Comment className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:scale-110 transition-transform" />
            <p className="text-black font-mono font-bold text-lg dark:text-white">
              {post.comments?.length || 0}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;