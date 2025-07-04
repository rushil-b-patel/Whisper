import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Report, ThreeDots, Trash, Reply, Heart, HeartSolid } from "../ui/Icons";
import { usePostService } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";

const CommentItem = React.memo(({
  comment,
  postId,
  depth = 0,
  onDeleteComment,
  onAddReply
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [optionOpen, setOptionOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes || 0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { deleteComment } = usePostService();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const handleDelete = useCallback(async () => {
    try {
      const response = await deleteComment(token, postId, comment._id);
      if (response.success) {
        onDeleteComment(comment._id);
        setOptionOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [deleteComment, token, postId, comment._id, onDeleteComment]);

  const handleReplySubmit = useCallback(async (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    await onAddReply(comment._id, text);
    setReplyText("");
    setShowReplyForm(false);
  }, [replyText, comment._id, onAddReply]);

  const toggleLike = useCallback(() => {
    setLikes((prev) => prev + (isLiked ? -1 : 1));
    setIsLiked((prev) => !prev);
  }, [isLiked]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (optionOpen && !e.target.closest(`#popup-${comment._id}`)) {
        setOptionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [optionOpen, comment._id]);

  const paddingLeft = useMemo(() => {
    return depth * 24;
  }, [depth]);

  return (
    <div className="relative mb-4">
      {depth > 0 && !isCollapsed && (
        <span
          className="absolute left-0 top-0 h-full border-l-2 border-gray-300 dark:border-gray-600"
          style={{ marginLeft: `${paddingLeft - 12}px` }}
        />
      )}

      {depth > 0 && !isCollapsed && (
        <span
          className="absolute top-4 w-4 border-t-2 border-gray-300 dark:border-gray-600"
          style={{ left: `${paddingLeft - 12}px` }}
        />
      )}

      <div
        className="flex justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 transition-all"
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
      >
        <div className="w-full">
          <div className="flex items-center mb-2">
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
            >
              {isCollapsed ? "[+]" : "[-]"}
            </button>
            <img
              src={comment.User?.userAvatar || `https://ui-avatars.com/api/?name=${comment.User?.userName || "User"}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full mr-3"
            />
            <div className="flex flex-col">
              <div className="flex items-center">
                <h4 className="font-semibold text-sm text-black dark:text-white">
                  {comment.User?.userName || "User"}
                </h4>
                {depth > 0 && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full">
                    Replying
                  </span>
                )}
              </div>
              <time className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </time>
            </div>
          </div>

          {!isCollapsed && (
            <>
              <p className="font-mono text-gray-700 dark:text-gray-300 mb-3">
                {comment.text}
              </p>

              <div className="flex items-center gap-4">
                <button onClick={toggleLike} className="flex items-center gap-1 text-sm transition-colors">
                  {isLiked ? (
                    <HeartSolid className="w-4 h-4 text-red-500" />
                  ) : (
                    <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  )}
                  <span>{likes}</span>
                </button>

                {depth < 4 && (
                  <button
                    onClick={() => setShowReplyForm((prev) => !prev)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-500"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                )}
              </div>

              {showReplyForm && (
                <form onSubmit={handleReplySubmit} className="mt-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    placeholder="Write a reply..."
                    className="w-full p-2 rounded-lg border bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowReplyForm(false)}
                      className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        <div className="relative ml-2" id={`popup-${comment._id}`}>
          <button onClick={() => setOptionOpen((prev) => !prev)}>
            <ThreeDots />
          </button>
          {optionOpen && (
            <ul className="absolute right-0 z-20 bg-white dark:bg-gray-800 rounded shadow-lg min-w-[120px]">
              {user?._id === comment.User._id && (
                <li
                  onClick={handleDelete}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Trash className="w-4 h-4" />
                  <span className="ml-2 text-sm">Delete</span>
                </li>
              )}
              <li
                onClick={() => console.log("Report")}
                className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <Report className="w-4 h-4" />
                <span className="ml-2 text-sm">Report</span>
              </li>
            </ul>
          )}
        </div>
      </div>

      {!isCollapsed && comment.replies?.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          postId={postId}
          depth={depth + 1}
          onDeleteComment={onDeleteComment}
          onAddReply={onAddReply}
        />
      ))}
    </div>
  );
});

const CommentThread = ({ post, comments: initialComments }) => {
  const [comments, setComments] = useState([]);
  const { addComment } = usePostService();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!initialComments) return;
    const map = {};
    const roots = [];
    initialComments.forEach((c) => (map[c._id] = { ...c, replies: [] }));
    initialComments.forEach((c) => {
      if (c.parentId && map[c.parentId]) map[c.parentId].replies.unshift(map[c._id]);
      else roots.push(map[c._id]);
    });
    setComments(roots);
  }, [initialComments]);

  const handleAddReply = useCallback(
    async (parentId, text) => {
      if (!token) return;
      const resp = await addComment(token, post._id, text, parentId);
      if (resp.success) {
        const newC = { ...resp.comment, User: { _id: user._id, userName: user.userName }, replies: [] };
        setComments((prev) => {
          if (!parentId) {
            return [newC, ...prev];
          }
          const insert = (list) =>
            list.map((item) => {
              if (item._id === parentId) return { ...item, replies: [newC, ...item.replies] };
              if (item.replies) return { ...item, replies: insert(item.replies) };
              return item;
            });
          return insert(prev);
        });
      }
    },
    [token, post._id, user, addComment]
  );

  const handleDeleteComment = useCallback(
    (commentId) => {
      setComments((prev) => {
        const remove = (list) =>
          list
            .filter((item) => item._id !== commentId)
            .map((item) => ({
              ...item,
              replies: item.replies ? remove(item.replies) : [],
            }));
        return remove(prev);
      });
    },
    []
  );

  return (
    <div className="mt-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          postId={post._id}
          depth={0}
          onDeleteComment={handleDeleteComment}
          onAddReply={handleAddReply}
        />
      ))}
    </div>
  );
};

export default CommentThread;