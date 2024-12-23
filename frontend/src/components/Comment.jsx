import React, { useMemo, useState } from "react";
import { ThreeDots } from "../ui/Icons";
import { usePostService } from "../context/PostContext";

function Comment({ post, comments, onDeleteComment }) {
    const [option, setOption] = useState(null);
    const { deleteComment } = usePostService();
    const token = localStorage.getItem("token"); 
    console.log(comments);
    const formattedComments = useMemo(() => {
        return comments.map((comment) =>({
            ...comment,
            formattedComments: new Date(comment.createdAt).toLocaleString(),
        }));
        }, [comments]);

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await deleteComment(token, post._id, commentId);
            if (response.success) {
                onDeleteComment(commentId);
                setOption(false);
                console.log("Comment deleted");
            } else {
                console.error("Failed to delete comment");
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    return (
        <div className="space-y-4">
            {formattedComments.map((comment) => (
                <div className="flex justify-between bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4" key={comment._id}>
                    <div>
                        <div className="flex items-center mb-2">
                            <img
                                src={comment?.User?.userAvatar || "/api/placeholder/32/32"}
                                alt="Commenter"
                                className="w-8 h-8 rounded-full mr-3"
                            />
                            <div>
                                <h4 className="font-mono text-sm font-semibold text-black dark:text-white">
                                    {comment?.User?.userName}
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
                        <button
                            className="text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300" 
                            onClick={() => setOption(option === comment._id ? null : comment._id)}>
                            <ThreeDots />
                        </button>
                        {option === comment._id && (
                            <ul className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded shadow-lg hover:shadow-none text-black dark:text-white transition">
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