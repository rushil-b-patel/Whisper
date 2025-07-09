import React, { useEffect, useState } from 'react';
import { Bolt, BoltSlash, BoltSlashSolid, BoltSolid } from '../ui/Icons';
import { usePostService } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function VoteBar({ id, initialVotes = 0, initialUpVoted = false, initialDownVoted = false }) {
  const [voteCount, setVoteCount] = useState(initialVotes);
  const [votes, setVotes] = useState({
    upVoted: initialUpVoted,
    downVoted: initialDownVoted,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { upVotePost, downVotePost, getPost } = usePostService();

  const token = localStorage.getItem('token');
  const { user } = useAuth();

  useEffect(() => {
    if (user && id) {
      const fetchVoteStatus = async () => {
        try {
          const response = await getPost(id);
          if (response && response.post) {
            const upVoted = response.post.upVotedUsers.includes(user._id);
            const downVoted = response.post.downVotedUsers.includes(user._id);
            setVotes({ upVoted, downVoted });
            setVoteCount(response.post.upVotes - response.post.downVotes);
          }
        } catch (err) {
          setError(err.message || 'Failed to load vote status');
          console.error('Error fetching vote status:', err);
        }
      };

      fetchVoteStatus();
    }
  }, [id, user]);

  const handleUpVote = async (event) => {
    event.stopPropagation();
    try {
      if (!user) {
        toast.error('Login to upvote', {
          position: 'bottom-right',
        });
        return;
      }

      if (isLoading) {
        return;
      }

      const previousVotes = { ...votes };
      const previousCount = voteCount;

      if (votes.upVoted) {
        setVotes({ upVoted: false, downVoted: false });
        setVoteCount(voteCount - 1);
      } else {
        setVotes({ upVoted: true, downVoted: false });
        setVoteCount(voteCount + (votes.downVoted ? 2 : 1));
      }

      setIsLoading(true);
      setError(null);

      const response = await upVotePost(token, id);

      if (!response || !response.success) {
        setVotes(previousVotes);
        setVoteCount(previousCount);
        throw new Error(response?.message || 'Failed to upvote post');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to upvote post', {
        position: 'bottom-right',
      });
      console.error('Upvote error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownVote = async (event) => {
    event.stopPropagation();
    try {
      if (!user) {
        toast.error('Login to downvote', {
          position: 'bottom-right',
        });
        return;
      }

      if (isLoading) {
        return;
      }

      const previousVotes = { ...votes };
      const previousCount = voteCount;

      if (votes.downVoted) {
        setVotes({ upVoted: false, downVoted: false });
        setVoteCount(voteCount + 1);
      } else {
        setVotes({ upVoted: false, downVoted: true });
        setVoteCount(voteCount - (votes.upVoted ? 2 : 1));
      }

      setIsLoading(true);
      setError(null);

      const response = await downVotePost(token, id);

      if (!response || !response.success) {
        setVotes(previousVotes);
        setVoteCount(previousCount);
        throw new Error(response?.message || 'Failed to downvote post');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to downvote post', {
        position: 'bottom-right',
      });
      console.error('Downvote error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-4 border border-gray-200 text-black dark:text-white dark:bg-slate-700 dark:border-none rounded-xl p-1 ${votes.upVoted ? 'bg-[#d93900]' : ''} ${votes.downVoted ? 'bg-[#6a5cff]' : ''} transition-all`}
    >
      <button
        className={`flex items-center space-x-2 transition-colors ${isLoading ? 'opacity-50' : ''}`}
        onClick={handleUpVote}
        disabled={isLoading}
        aria-label="Upvote"
        title={votes.upVoted ? 'Remove upvote' : 'Upvote'}
      >
        {votes.upVoted ? <BoltSolid /> : <Bolt />}
      </button>
      <p
        className={`font-mono font-bold text-lg px-1 ${votes.upVoted || votes.downVoted ? 'text-white' : ''}`}
      >
        {voteCount}
      </p>
      <button
        className={`flex items-center space-x-2 transition-colors ${isLoading ? 'opacity-50' : ''}`}
        onClick={handleDownVote}
        disabled={isLoading}
        aria-label="Downvote"
        title={votes.downVoted ? 'Remove downvote' : 'Downvote'}
      >
        {votes.downVoted ? <BoltSlashSolid /> : <BoltSlash />}
      </button>
    </div>
  );
}

export default VoteBar;
