import React, { useState } from "react";
import { HorizontalOption } from "../ui/Icons";
import { usePostService } from "../context/PostContext";

function Comment({ post, onCommentDeleted }) {
    const [option, setOption] = useState(null);
    const { deleteComment } = usePostService();
    const token = localStorage.getItem("token"); 
    const [comments, setComments] = useState(post.comments || []);

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await deleteComment(token, post._id, commentId);
            if (response.success) {
                setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
                setOption(false);
                console.log("Comment deleted");
                if (onCommentDeleted) onCommentDeleted(commentId);
            } else {
                console.error("Failed to delete comment");
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    return (
        <div className="space-y-4">
            {comments.map((comment) => (
                <div className="flex justify-between bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4" key={comment._id}>
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
                                    {new Date(comment?.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-mono">
                            {comment.text}
                        </p>
                    </div>
                    <div className="relative">
                        <button onClick={() => setOption(option === comment._id ? null : comment._id)}>
                            <HorizontalOption />
                        </button>
                        {option === comment._id && (
                            <ul className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded shadow-lg text-gray-600 dark:text-gray-300">
                                <li>
                                    <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                        Delete
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Comment;