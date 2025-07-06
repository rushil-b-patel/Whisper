import { useEffect, useState, useCallback } from "react";
import VoteBar from "./VoteBar";
import { useAuth } from "../context/AuthContext";
import { usePostService } from "../context/PostContext";
// import { format } from "date-fns";

const CommentItem = ({
  comment,
  postId,
  depth = 0,
  onReplyClick,
  onDeleteComment,
}) => {
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const { getCommentsByParentId } = usePostService();
  const [showReplies, setShowReplies] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReplies = async () => {
      const response = await getCommentsByParentId(token, postId, comment._id);
      if (response && response.success) {
        setReplies(response.comments);
      }
    };
    fetchReplies();
  }, [postId, comment._id]);

  return (
    <div className="relative">
      {depth > 0 && (
        <svg
          className="absolute -left-5 top-6 h-full w-10"
          viewBox="0 0 20 100"
          preserveAspectRatio="none"
        >
          <path
            d="M10 0 Q0 20 10 40 T10 100"
            stroke="#d1d5db"
            fill="transparent"
            strokeWidth="2"
          />
        </svg>
      )}

      <div
        className={`ml-${depth * 6} py-4 pl-4 transition-all relative group`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="bg-gray-300 dark:bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center">
              {comment.userName?.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700 dark:text-white">
              {comment.userName}
            </span>
            <span className="text-xs text-gray-400">
              {/* {format(new Date(comment.createdAt), "Pp")} */}
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-800 dark:text-gray-200 mt-2 ml-10">
          {comment.text}
        </div>

        <div className="flex items-center justify-between mt-2 ml-10">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button onClick={() => onReplyClick(comment._id)}>Reply</button>
            {user && user._id === comment.userId && (
              <button
                className="text-red-400"
                onClick={() => onDeleteComment(comment._id)}
              >
                Delete
              </button>
            )}
          </div>

          <div className="scale-90">
            <VoteBar
              id={comment._id}
              initialVotes={comment.upVotes - comment.downVotes}
              initialUpVoted={comment.upVotedUsers?.includes(user?._id)}
              initialDownVoted={comment.downVotedUsers?.includes(user?._id)}
            />
          </div>
        </div>

        {showReplies && replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                postId={postId}
                depth={depth + 1}
                onReplyClick={onReplyClick}
                onDeleteComment={onDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentThread = ({ post, comments: initialComments }) => {
  const [comments, setComments] = useState([]);
  const [topLevelText, setTopLevelText] = useState("");
  const { addComment } = usePostService();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const map = {};
    const roots = [];

    initialComments?.forEach((c) => (map[c._id] = { ...c, replies: [] }));
    initialComments?.forEach((c) => {
      if (c.parentId && map[c.parentId]) map[c.parentId].replies.unshift(map[c._id]);
      else roots.unshift(map[c._id]);
    });

    setComments(roots);
  }, [initialComments]);

  const handleAddReply = useCallback(
    async (parentId, text) => {
      const resp = await addComment(token, post._id, text, parentId);
      if (resp.success) {
        const newComment = {
          ...resp.comment,
          User: { _id: user._id, userName: user.userName },
          replies: [],
        };
        setComments((prev) =>
          parentId
            ? prev.map((c) => {
                if (c._id === parentId)
                  return { ...c, replies: [newComment, ...c.replies] };
                return { ...c, replies: c.replies && updateReply(c.replies, parentId, newComment) };
              })
            : [newComment, ...prev]
        );
      }
    },
    [addComment, post._id, token, user]
  );

  const updateReply = (list, parentId, newComment) => {
    return list.map((item) => {
      if (item._id === parentId) return { ...item, replies: [newComment, ...item.replies] };
      return { ...item, replies: updateReply(item.replies || [], parentId, newComment) };
    });
  };

  const handleDeleteComment = useCallback((commentId) => {
    const remove = (list) =>
      list
        .filter((c) => c._id !== commentId)
        .map((c) => ({ ...c, replies: remove(c.replies || []) }));
    setComments((prev) => remove(prev));
  }, []);

  const handleSubmitTopLevel = async (e) => {
    e.preventDefault();
    const text = topLevelText.trim();
    if (!text) return;
    await handleAddReply(null, text);
    setTopLevelText("");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmitTopLevel}>
        <textarea
          value={topLevelText}
          onChange={(e) => setTopLevelText(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full p-3 rounded border dark:bg-gray-800 dark:border-gray-600"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!topLevelText.trim()}
            className="bg-indigo-600 text-white px-4 py-1 rounded disabled:opacity-50"
          >
            Comment
          </button>
        </div>
      </form>

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
