import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePostService } from "../context/PostContext";
import VoteBar from "../components/VoteBar";
import toast from "react-hot-toast";
import Comment from "../components/Comment";
import { useAuth } from "../context/AuthContext";
import { Bars, Trash, Save, ChevronLeft, Share } from "../ui/Icons";

function PostDetail() {
  const { id } = useParams();
  const { getPost, addComment, deleteComment } = usePostService();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null);
  
  const handleSavePost = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Login to save post", { position: "bottom-right" });
        return;
      }
      
      // Implement save post functionality here when available
      toast.success("Post saved successfully", { position: "bottom-right" });
      setShowOptions(false);
    } catch (err) {
      console.error("Error saving post:", err);
      toast.error(err.message || "Failed to save post", { position: "bottom-right" });
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Login to delete post", { position: "bottom-right" });
        return;
      }
      
      if (!user || user._id !== post?.user?._id) {
        toast.error("You can only delete your own posts", { position: "bottom-right" });
        return;
      }
      
      // Add confirmation dialog
      if (!window.confirm("Are you sure you want to delete this post?")) {
        return;
      }
      
      setIsLoading(true);
      // Implement delete post API call when available
      // const response = await deletePost(token, id);
      
      toast.success("Post deleted successfully", { position: "bottom-right" });
      navigate('/');
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error(err.message || "Failed to delete post", { position: "bottom-right" });
    } finally {
      setIsLoading(false);
      setShowOptions(false);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await getPost(id);
        setPost(response.post);
        setComments(response.post.comments || []);
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, getPost]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
  
    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const handleAddComment = useCallback(async (event) => {
    event.preventDefault();
  
    if (!comment.trim()) {
      toast.error("Comment cannot be empty", { position: "bottom-right" });
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Login to comment", { position: "bottom-right" });
        return;
      }
  
      const response = await addComment(token, id, comment);
      if (response.success) {
        setComments((prevComments) => [response.comment, ...prevComments]);
        setComment("");
        toast.success("Comment added successfully", { position: "bottom-right" });
      } else {
        toast.error(response.message || "Failed to add comment", { position: "bottom-right" });
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error(err.message || "Failed to add comment", { position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  }, [comment, id, addComment]);
  
  const handleDeleteComment = useCallback(async (commentId) => {
    if (!commentId) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Login to delete comment", { position: "bottom-right" });
        return;
      }
      
      await deleteComment(token, id, commentId);
      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error(err.message || "Failed to delete comment", { position: "bottom-right" });
    }
  }, [id, deleteComment]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4em)] flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-[calc(100vh-4em)] flex items-center justify-center dark:bg-[#0e1113]">
        <div className="text-gray-500">No post found</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-[#0e1113] py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 lg:ml-14 flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span className="font-mono">Back to feed</span>
      </button>

      <div className="max-w-4xl mx-auto border-[1px] dark:border-[#2A3236] rounded">
        <div className="overflow-hidden bg-white dark:bg-[#0e1113]">
          <div className="px-6 py-4">
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
                  {post?.user?.userName || "Deleted User"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {post?.user?.department || "Deleted Department"} •{" "}
                  {new Date(post?.createdAt).toString().split(" ").slice(1, 4).join(" ")}
                </p>
              </div>
              <div className="ml-auto relative">
                {user?._id === post?.user?._id && (
                  <div className="auto relative" ref={dropdownRef}>
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setShowOptions(!showOptions)}
                    >
                      <div className="w-5 h-5 text-gray-600 dark:text-gray-300">
                        <Bars />
                      </div>
                    </button>
                    {showOptions && (
                      <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                        <div className="flex items-center cursor-pointer space-x-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <div className="text-black dark:text-white">
                            <Save />
                          </div>
                          <button
                            className="text-lg text-left text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={handleSavePost}
                          >
                            Save
                          </button>
                        </div>
                        <div className="flex items-center cursor-pointer space-x-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <div className="text-black dark:text-white">
                            <Trash />
                          </div>
                            <button
                            className="text-lg text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={handleDeletePost}
                            >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold font-mono text-indigo-600 bg-clip-text dark:text-indigo-400">
              {post?.title}
            </h1>

            {post?.image && (
              <div className="relative my-2 rounded-xl overflow-hidden group">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            <div className="prose prose-indigo dark:prose-invert max-w-none mb-8">
              <p className="text-gray-700 dark:text-[#eef1f3] leading-relaxed font-mono">
                {post?.description}
              </p>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
              <div className="flex items-center justify-between">
                <VoteBar 
                  id={id} 
                  initialVotes={post ? post.upVotes - post.downVotes : 0}
                  initialUpVoted={user && post?.upVotedUsers?.includes(user._id)}
                  initialDownVoted={user && post?.downVotedUsers?.includes(user._id)}
                />
                <button className="flex items-center space-x-2 text-black hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors">
                  <Share className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="mt-3 text-lg font-semibold font-sans text-black dark:text-white">
                Comments
              </h3>
              <div className="mb-6 mt-3">
                <form onSubmit={handleAddComment}>
                  <textarea
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 transition-all font-mono resize-none"
                    rows={1}
                    onChange={(e) => setComment(e.target.value)}
                    value={comment}
                  />
                  <button
                    type="submit"
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-sans font-semibold text-sm"
                  >
                    {isLoading ? "Posting..." : "Post Comment"}
                  </button>
                </form>
              </div>
              <Comment
                post={post}
                comments={comments}
                onDeleteComment={handleDeleteComment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;