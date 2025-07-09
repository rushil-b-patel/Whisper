import React, { useState, useEffect, useCallback } from "react";
import { Trash, Reply } from "../ui/Icons";
import { useAuth } from "../context/AuthContext";
import { usePostService } from "../context/PostContext";

const CommentItem = ({ comment, postId, onAddReply, onDeleteComment }) => {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuth();
  const { deleteComment } = usePostService();
  const token = localStorage.getItem("token");

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await onAddReply(null, replyText);
    setReplyText("");
    setReplying(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this comment?")) {
      await deleteComment(token, postId, comment._id);
      onDeleteComment(comment._id);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e1f23] border dark:border-[#2A2B30] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
          {comment.User?.userName?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
              {comment.User?.userName || "User"}
            </h4>
            <time className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {new Date(comment.createdAt).toLocaleString()}
            </time>
          </div>

          <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 font-mono">
            {comment.content || comment.text}
          </p>

          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
            <button
              onClick={() => setReplying((prev) => !prev)}
              className="hover:text-indigo-500 transition-colors flex items-center gap-1"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
            {user?._id === comment.User?._id && (
              <button
                onClick={handleDelete}
                className="hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Trash className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>

          {replying && (
            <form onSubmit={handleReply} className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write your reply..."
                className="w-full p-2 rounded-lg border bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
              />
              <div className="flex justify-end mt-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReplying(false)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentThread = ({ post, comments: initialComments }) => {
  const [comments, setComments] = useState([]);
  const { addComment } = usePostService();
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  const handleAddComment = useCallback(
    async (parentId, text) => {
      const resp = await addComment(token, post._id, text, parentId);
      if (resp.success) {
        const newC = {
          ...resp.comment,
          User: { _id: user._id, userName: user.userName },
        };
        setComments((prev) => [newC, ...prev]);
      }
    },
    [addComment, post._id, token, user]
  );

  const handleDeleteComment = useCallback((commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await handleAddComment(null, newComment.trim());
    setNewComment("");
  };

  return (
    <div className="space-y-6 mt-8">
      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          rows={3}
          className="w-full p-3 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="bg-indigo-600 text-white px-4 py-1 rounded disabled:opacity-50"
          >
            Comment
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            postId={post._id}
            onAddReply={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        ))
      )}
    </div>
  );
};

export default CommentThread;
