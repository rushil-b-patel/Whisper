/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Bolt, BoltSlash, BoltSolid, BoltSlashSolid } from '../ui/Icons';
import { usePostService } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VoteBar({
  id,
  postId,
  isComment = false,
  initialVotes = 0,
  initialUpVoted = false,
  initialDownVoted = false,
}) {
  const [count, setCount] = useState(initialVotes);
  const [state, setState] = useState({
    up: initialUpVoted,
    down: initialDownVoted,
  });
  const [busy, setBusy] = useState(false);
  const { upVotePost, downVotePost, voteComment, getPost } = usePostService();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      try {
        const res = await getPost(postId || id);
        const p = res.post;
        if (isComment) {
          const comment = p.comments.find((c) => c.id === id);
          setState({
            up: comment?.upVotedUsers.includes(user.id),
            down: comment?.downVotedUsers.includes(user.id),
          });
          setCount(comment.upVotes - comment.downVotes);
        } else {
          setState({
            up: p.upVotedUsers.includes(user.id),
            down: p.downVotedUsers.includes(user.id),
          });
          setCount(p.upVotes - p.downVotes);
        }
      } catch (e) {
        console.error('VoteBar fetch error', e);
      }
    })();
  }, [id, user]);

  const cast = async (type) => {
    if (!user) {
      toast.error('Log in to vote', { position: 'bottom-right' });
      return;
    }
    if (busy) return;
    setBusy(true);

    const prevState = { ...state };
    const prevCount = count;
    const removing = state[type];
    let delta;
    if (type === 'up') {
      delta = removing ? -1 : state.down ? +2 : +1;
      setState({ up: !removing, down: false });
    } else {
      delta = removing ? +1 : state.up ? -2 : -1;
      setState({ up: false, down: !removing });
    }
    setCount(prevCount + delta);

    try {
      const action = isComment
        ? () => voteComment(token, postId, id, type)
        : type === 'up'
          ? () => upVotePost(token, id)
          : () => downVotePost(token, id);

      const res = await action();
      if (!res.success) throw new Error(res.message);
    } catch (e) {
      setState(prevState);
      setCount(prevCount);
      toast.error(e.message || 'Vote failed');
    } finally {
      setBusy(false);
    }
  };

  const base = isComment
    ? 'text-sm px-2 py-1 space-x-1 rounded-full'
    : 'px-4 py-2 space-x-4 rounded-full';
  const bg = state.up
    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
    : state.down
      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
      : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100';

  return (
    <div
      className={`flex items-center justify-center ${base} border border-gray-200 dark:border-gray-700 shadow-sm transition ${bg}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => cast('up')}
        disabled={busy}
        className="p-1 hover:scale-110 transition"
        title={state.up ? 'Remove upvote' : 'Upvote'}
      >
        {state.up ? <BoltSolid /> : <Bolt />}
      </button>

      <span className="font-mono font-semibold">{count}</span>

      <button
        onClick={() => cast('down')}
        disabled={busy}
        className="p-1 hover:scale-110 transition"
        title={state.down ? 'Remove downvote' : 'Downvote'}
      >
        {state.down ? <BoltSlashSolid /> : <BoltSlash />}
      </button>
    </div>
  );
}
