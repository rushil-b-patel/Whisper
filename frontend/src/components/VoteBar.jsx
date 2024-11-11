import React from "react";
import { ChevronDown, ChevronUp } from "../ui/Icons";

function VoteBar({votes, handleUpVote, handleDownVote, post}) {
  return (
    <div className="flex items-center gap-2 border border-gray-200 dark:bg-slate-700 dark:border-none rounded-xl p-1">
      <button
        className={`flex items-center space-x-2 transition-colors ${
          votes.upVoted
            ? "text-red-500 dark:text-red-500"
            : "text-black dark:text-white"
        }`}
        onClick={handleUpVote}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      <p className="text-black dark:text-white">
        {post.upVotes - post.downVotes}
      </p>
      <button
        className={`flex items-center space-x-2 transition-colors ${
          votes.downVoted
            ? "text-blue-500 dark:text-blue-500"
            : "text-black dark:text-white"
        }`}
        onClick={handleDownVote}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}

export default VoteBar;
