import React, { useState } from "react";

function Comment({post}) {

    const [option, setOption] = useState(true);

  return (
    <div className="space-y-4">
      {post.comments.map((text, index) => (
        <div className="flex justify-between bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4" key={index}>
            <div>
                <div className="flex items-center mb-2">
                    <img
                        src={post?.user?.userAvatar || "/api/placeholder/32/32"}
                        alt="Commenter"
                        className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                        <h4 className="font-mono text-sm font-semibold text-black dark:text-white">
                            {post?.user?.userName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(text?.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-mono">
                    {text.text}
                </p>
            </div>
            <div>
                3 dots
            </div>
        </div>
      ))}
    </div>
  );
}

export default Comment;
