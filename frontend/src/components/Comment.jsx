import { useState, useEffect, useCallback } from 'react';
import { Trash, Reply } from '../ui/Icons';
import { useAuth } from '../context/AuthContext';
import { usePostService } from '../context/PostContext';
import VoteBar from './VoteBar';

function CommentItem({ comment, postId, onAddReply, onDeleteComment }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();
  const { deleteComment } = usePostService();
  const token = localStorage.getItem('token');

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await onAddReply(null, replyText);
    setReplyText('');
    setReplying(false);
  };

  const handleDelete = async () => {
    if (confirm('Delete this comment?')) {
      await deleteComment(token, postId, comment._id);
      onDeleteComment(comment._id);
    }
  };

  const voteCount = (comment.upVotes || 0) - (comment.downVotes || 0);
  const upVoted = comment.upVotedUsers?.includes(user?._id);
  const downVoted = comment.downVotedUsers?.includes(user ?._id);

  return (
    <div className="bg-white dark:bg-[#1e1f23] border dark:border-[#2A2B30] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-2">
        <div className="font-mono font-semibold text-gray-900 dark:text-white">
          {comment.user?.userName || 'User'}
        </div>
        <time className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(comment.createdAt).toLocaleString()}
        </time>
      </div>

      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">{comment.text}</p>

      <div className="flex justify-between items-center">
        <VoteBar
          commentId={comment._id}
          postId={postId}
          isComment
          initialVotes={voteCount}
          initialUpVoted={upVoted}
          initialDownVoted={downVoted}
        />
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <button
            onClick={() => setReplying((r) => !r)}
            className="flex items-center gap-1 hover:text-indigo-500"
          >
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>

          {user?._id === comment.User?._id && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 hover:text-red-500"
            >
              <Trash className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {replying && (
        <form onSubmit={handleReply} className="mt-3 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white"
            placeholder="Write your reply…"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setReplying(false)}
              className="text-sm text-gray-500"
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
  );
}

export default function CommentThread({ post, comments: initialComments }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { addComment } = usePostService();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  const handleAdd = useCallback(
    async (parentId, text) => {
      const resp = await addComment(token, post._id, text, parentId);
      if (resp.success) {
        setComments((c) => [
          { ...resp.comment, User: { _id: user._id, userName: user.userName } },
          ...c,
        ]);
      }
    },
    [addComment, post._id, token, user]
  );

  const handleDelete = useCallback((id) => {
    setComments((c) => c.filter((x) => x._id !== id));
  }, []);

  const submitTop = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await handleAdd(null, newComment.trim());
    setNewComment('');
  };

  return post.allowComments ? (
    <div className="space-y-6 mt-8">
      <form onSubmit={submitTop} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="w-full p-3 rounded border dark:bg-gray-800 dark:text-white"
          placeholder="Leave a comment…"
        />
        <div className="flex justify-end">
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
        <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">No comments yet…</p>
      ) : (
        comments.map((c) => (
          <CommentItem
            key={c._id}
            comment={c}
            postId={post._id}
            onAddReply={handleAdd}
            onDeleteComment={handleDelete}
          />
        ))
      )}
    </div>
  ) : (
    <p className="text-gray-500 dark:text-gray-400 text-sm font-mono mt-8">
      Comments are disabled for this post.
    </p>
  );
}

