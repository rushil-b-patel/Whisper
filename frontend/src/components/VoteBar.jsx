import React, { useEffect, useState } from "react";
import { Bolt, BoltSlash, BoltSlashSolid, BoltSolid } from "../ui/Icons";
import { usePostService } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function VoteBar({ id }) {

  const [post, setPost] = useState(null);
  const [votes, setVotes] = useState({upVoted: false, downVoted: false});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { upVotePost, downVotePost, getPost } = usePostService();

  const token = localStorage.getItem("token");
  const { user } = useAuth();

  useEffect(() => {
  
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getPost(id);
        setPost(response.post);
        const upVoted = response.post.upVotedUsers.includes(user._id);
        const downVoted = response.post.downVotedUsers.includes(user._id);
        setVotes({ upVoted, downVoted });
      } catch (err) {
        setError(err.message || "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    } else {
      setError("No post ID provided");
      setIsLoading(false);
    }
  }, [id]);


  const handleUpVote = async (event) => {
    event.stopPropagation();
    try{
      if(!token){
        toast.error("You need to login to upvote a post",{
          position:"bottom-right"
        });
        throw new Error("You need to login to upvote a post");
      }
      const response = await upVotePost(token, id);
      if(!response){
        toast.error("Failed to upvote post",{
          position:"bottom-right"
        });
        throw new Error("Failed to upvote post");
      }
      if(response.success){
        setPost((prev)=>({...prev, upVotes: response.post.upVotes, downVotes: response.post.downVotes}));
        setVotes({ upVoted: !votes.upVoted, downVoted: false });
      }
      else{
        alert(response.message);
      }
    }
    catch(err){
      setError(err.message);
    }
  };

  const handleDownVote = async (event) => {
    event.stopPropagation();
    try{
      if(!token){
        toast.error("You need to login to downvote a post",{
          position:"bottom-right"
        });
        throw new Error("You need to login to downvote a post");
      }
      const response = await downVotePost(token, id);
      if(!response){
        toast.error("Failed to downvote post",{
          position:"bottom-right"
        });
        throw new Error("Failed to downvote post");
      }
      if(response.success){
        setPost((prev)=>({...prev, upVotes: response.post.upVotes, downVotes: response.post.downVotes}));
        setVotes({ upVoted: false, downVoted: !votes.downVoted }); 
      }
      else{
        alert(response.message);
      }
    }
    catch(err){
      setError(err.message);
    }
  };

  if(isLoading || !post){
    return (
      <div className="text-black dark:text-white font-mono">
        0
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 border border-gray-200 text-black dark:text-white dark:bg-slate-700 dark:border-none rounded-xl p-1 ${votes.upVoted ? "bg-[#d93900]" : ""} ${votes.downVoted ? "bg-[#6a5cff]" : ""} transition-all`}>
      <button
        className={`flex items-center space-x-2 transition-colors`}
        onClick={handleUpVote}
      >
        {votes.upVoted ? <BoltSolid /> : <Bolt />}
      </button>
      <p className={`font-mono font-bold text-lg px-1 ${votes.upVoted || votes.downVoted ? "text-white" : ""}`} >
        {post.upVotes - post.downVotes}
      </p>
      <button
        className={`flex items-center space-x-2 transition-colors`}
        onClick={handleDownVote}
      >
        {votes.downVoted ? <BoltSlashSolid /> : <BoltSlash />}
      </button>
    </div>
  );
}

export default VoteBar;