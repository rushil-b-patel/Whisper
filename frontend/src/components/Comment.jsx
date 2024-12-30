import React, { useEffect, useMemo, useState } from "react";
import { Report, ThreeDots, Trash } from "../ui/Icons";
import { usePostService } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";

function Comment({ post, comments, onDeleteComment }) {
    const [option, setOption] = useState(null);
    const { deleteComment } = usePostService();
    const { user } = useAuth();
    const token = localStorage.getItem("token");

    const formattedComments = useMemo(() => {
        return comments.map((comment) => ({
            ...comment,
            formattedComments: new Date(comment.createdAt).toLocaleString(),
        }));
    }, [comments]);

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await deleteComment(token, post._id, commentId);
            if (response.success) {
                onDeleteComment(commentId);
                setOption(null);
                console.log("Comment deleted");
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    // useEffect(() => {
    //     console.log("Updated comments: ", comments)
    // }, [comments]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (option && !e.target.closest(`#popup-${option}`)) {
                setOption(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [option]);

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
                        <p className="text-gray-700 dark:text-gray-300 font-mono">{comment.text}</p>
                    </div>
                    <div className="relative" id={`popup-${comment._id}`}>
                        <button
                            className="text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-400"
                            onClick={() => setOption(option === comment._id ? null : comment._id)}
                        >
                            <ThreeDots />
                        </button>
                        {option === comment._id && (
                            <ul className="absolute right-0 bg-white dark:bg-gray-800 rounded shadow-lg hover:shadow-none text-black dark:text-white transition">
                                <li>
                                    {user?._id === comment.User._id && 
                                    <div 
                                        className="flex items-center cursor-pointer space-x-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => handleDeleteComment(comment._id)}
                                    >
                                        <Trash />
                                        <button
                                            
                                            className="w-full"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    }
                                    <div className="flex items-center cursor-pointer space-x-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Report />
                                        <button
                                            onClick={() => console.log("Reported comment")}
                                            className="w-full"
                                            >
                                            Report
                                        </button>
                                    </div>
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