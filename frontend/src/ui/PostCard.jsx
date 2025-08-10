import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Comment } from './Icons';
import VoteBar from '../components/VoteBar';
import { useAuth } from '../context/AuthContext';
import { EditorRenderer } from '../components/Editor';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const go = useCallback(() => post?._id && navigate(`/post/${post._id}`), [post?._id, navigate]);

  const voteCount = post.upVotes - post.downVotes;
  const upVoted = user && post.upVotedUsers.includes(user._id);
  const downVoted = user && post.downVotedUsers.includes(user._id);

  if (!post) return <div className="p-4 text-red-500">Missing post data</div>;

  return (
    <div
      className="bg-white dark:bg-[#0e1113] p-5 sm:p-6 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border border-gray-200 dark:border-slate-800"
      onClick={go}
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={post.avatar || `https://ui-avatars.com/api/?name=${post.user?.userName || 'User'}`}
          alt="User Avatar"
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
        />
        <div className="flex flex-col font-mono">
          <span className="text-sm font-semibold text-black dark:text-white truncate">
            {post.user?.userName || 'Deleted User'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {post.user?.department || 'General'} • {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <h3 className="font-mono text-xl font-bold mb-2 text-black dark:text-white">{post.title}</h3>

      <div className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
        <EditorRenderer data={post.description} />
      </div>

      {post.image && (
        <img
          src={post.image}
          alt="Post visual"
          className="w-full rounded-lg mb-4 object-cover max-h-48"
        />
      )}

      <div className="flex justify-between items-center">
        <VoteBar
          postId={post._id}
          initialVotes={voteCount}
          initialUpVoted={upVoted}
          initialDownVoted={downVoted}
        />
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <Comment className="w-5 h-5" />
          <span className="font-mono">{post.commentCount || 0}</span>
        </div>
      </div>
    </div>
  );
}
