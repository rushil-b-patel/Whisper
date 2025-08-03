import { useEffect, useState } from 'react';
import { Bolt, BoltSlash, BoltSolid, BoltSlashSolid } from '../ui/Icons';
import { usePostService } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VoteBar({
  postId,
  commentId,
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
    if (!user || !postId) return;

    if (isComment) {
      setState({
        up: initialUpVoted,
        down: initialDownVoted,
      });
      setCount(initialVotes);
    } else {
      (async () => {
        try {
          const res = await getPost(postId);
          const p = res.post;
          if (!p) return;

          setState({
            up: p.upVotedUsers.includes(user._id),
            down: p.downVotedUsers.includes(user._id),
          });
          setCount(p.upVotes - p.downVotes);
        } catch (e) {
          console.warn('VoteBar fetch error (post)', e);
        }
      })();
    }
  }, [postId, user, isComment, initialUpVoted, initialDownVoted, initialVotes]);


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
        ? () => voteComment(token, postId, commentId, type)
        : type === 'up'
          ? () => upVotePost(token, postId)
          : () => downVotePost(token, postId);

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

const base = 'px-4 py-2 space-x-4 rounded-full text-sm';
const bg = state.up
  ? 'bg-[#3DB2FF] text-blue-100'
  : state.down
    ? 'bg-[#DA1212] text-black'
    : 'bg-white text-gray-800 dark:bg-slate-800 dark:text-white';


  return (
    <div
      className={`flex items-center justify-center ${base} border border-gray-200 dark:border-gray-700 shadow-sm transition ${bg}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => cast('up')}
        disabled={busy}
        className="p-1 hover:scale-110 hover:opacity-90 transition"
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
