import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePostService } from "../context/PostContext";
import { ChevronLeft, Share2, Bookmark} from "lucide-react";
import { ChevronDown, ChevronUp } from "../ui/Icons";

function PostDetail() {
  const { id } = useParams();
  const { getPost } = usePostService();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { upVotePost, downVotePost } = usePostService();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getPost(id);
        setPost(response.post);
      } catch (err) {
        console.error("Error fetching post:", err);
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
  }, []);

  const handleUpVote = async () => {
    try{
      if(!token){
        throw new Error("You need to login to upvote a post");
      }
      const response = await upVotePost(token, id);
      if(!response){
        throw new Error("Failed to upvote post");
      }
      if(response.success){
        setPost((prev)=>({...prev, upVotes: response.post.upVotes, downVotes: response.post.downVotes}));
      }
      else{
        alert(response.message);
      }
    }
    catch(err){
      console.error("Error upvoting post:", err);
      setError(err.message);
    }
  };

  const handleDownVote = async () => {
    try{
      if(!token){
        throw new Error("You need to login to downvote a post");
      }
      const response = await downVotePost(token, id);
      if(!response){
        throw new Error("Failed to downvote post");
      }
      if(response.success){
        setPost((prev)=>({...prev, upVotes: response.post.upVotes, downVotes: response.post.downVotes}));
      }
      else{
        alert(response.message);
      }
    }
    catch(err){
      console.error("Error downvoting post:", err);
      setError(err.message);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No post found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 lg:ml-14 flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span className="font-mono">Back to feed</span>
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="overflow-hidden bg-white dark:bg-black shadow-md dark:shadow-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-400 rounded-full blur-md opacity-20 group-hover:opacity-30 trasition-opacity" />
                <img
                  src={post?.avatar || "/api/placeholder/48/48"}
                  alt={post?.user?.userName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-900 relative z-10"
                />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold font-mono text-gray-900 dark:text-white">
                  {post?.user?.userName || "Unknown User"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {post?.user?.department || "Unknown Department"} • {(new Date(post?.createdAt)).toString().split(" ").slice(1, 4).join(" ")}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 font-mono bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              {post?.title}
            </h1>

            {post?.image && (
              <div className="relative mb-6 rounded-xl overflow-hidden group">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full object-cover rounded-xl max-h-[500px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            <div className="prose prose-indigo dark:prose-invert max-w-none mb-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-mono">
                {post?.description}
              </p>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 border border-gray-200 dark:bg-slate-700 rounded-xl p-1">
                  <button className="flex items-center space-x-2 text-black hover:text-red-500 dark:text-white dark:hover:text-red-500 transition-colors"
                    onClick={handleUpVote}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  {post.upVotes - post.downVotes}
                  <button className="flex items-center space-x-2 text-black hover:text-blue-500 dark:text-white dark:hover:text-blue-500 transition-colors"
                    onClick={handleDownVote}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-black hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="flex items-center space-x-2 text-black hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="mt-3 text-lg font-semibold font-mono text-black dark:text-white">
                Comments
              </h3>
              <div className="mb-6 mt-3">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 transition-all font-mono resize-none"
                  rows={1}
                />
                <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-mono font-semibold text-sm">
                  Post Comment
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <img
                      src="/api/placeholder/32/32"
                      alt="Commenter"
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-mono font-semibold text-gray-900 dark:text-white">
                        Sample User
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-mono">
                    This is a sample comment. Replace with actual comment data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
