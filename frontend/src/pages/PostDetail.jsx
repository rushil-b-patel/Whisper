import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePostService } from "../context/PostContext";
import VoteBar from "../components/VoteBar";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import CommentThread from "../components/CommentThread";
import { Bars, Trash, Save, ChevronLeft, Share } from "../ui/Icons";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPost, addComment, deleteComment } = usePostService();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const { post } = await getPost(id);
        setPost(post);
      } catch {
        toast.error("Could not load post", { position: "bottom-right" });
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetch();
  }, [id, getPost]);

  const handleSave = () => {
    if (!user) {
      toast.error("Login to save post", { position: "bottom-right" });
      return;
    }
    toast.success("Post saved", { position: "bottom-right" });
    setShowOptions(false);
  };

  const handleDelete = async () => {
    if (!user || user._id !== post.user._id) {
      toast.error("You can only delete your own posts", { position: "bottom-right" });
      return;
    }
    if (!window.confirm("Delete this post?")) return;
    setIsLoading(true);
    toast.success("Post deleted", { position: "bottom-right" });
    navigate("/");
  };

  const handleAddReply = useCallback(
    async (parentId, text) => {
      if (!user) {
        toast.error("Login to comment", { position: "bottom-right" });
        return;
      }
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const resp = await addComment(token, post._id, text, parentId);
        if (!resp.success) throw new Error(resp.message);
        const { post: updated } = await getPost(id);
        setPost(updated);
      } catch (err) {
        toast.error(err.message || "Failed to comment", { position: "bottom-right" });
      } finally {
        setIsLoading(false);
      }
    },
    [addComment, getPost, id, post, user]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      if (!user) {
        toast.error("Login to delete comment", { position: "bottom-right" });
        return;
      }
      try {
        const token = localStorage.getItem("token");
        await deleteComment(token, post._id, commentId);
        const { post: updated } = await getPost(id);
        setPost(updated);
      } catch (err) {
        toast.error(err.message || "Failed to delete comment", { position: "bottom-right" });
      }
    },
    [deleteComment, getPost, id, post, user]
  );

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
        className="mb-6 lg:ml-14 flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span className="font-mono">Back to feed</span>
      </button>

      <div className="max-w-4xl mx-auto border dark:border-[#2A3236] rounded bg-white dark:bg-[#0e1113] overflow-hidden">
        <header className="px-6 py-4 flex items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-400 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity" />
            <img
              src={post.user.profilePicture || `https://ui-avatars.com/api/?name=${post.user.userName}`}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-900 relative z-10"
            />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold font-mono text-gray-900 dark:text-white">
              {post.user.userName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {post.user.department || "Unknown Dept"} •{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          {user?._id === post.user._id && (
            <div className="ml-auto relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bars className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Save className="w-5 h-5 text-black dark:text-white" />
                    <span className="ml-2 text-sm">Save</span>
                  </div>
                  <div
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Trash className="w-5 h-5 text-black dark:text-white" />
                    <span className="ml-2 text-sm">Delete</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        <article className="px-6 pb-6">
          <h1 className="text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mb-4">
            {post.title}
          </h1>
          {post.image && (
            <div className="mb-4 overflow-hidden rounded-xl group relative">
              <img src={post.image} alt="" className="w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <div className="prose prose-indigo dark:prose-invert max-w-none mb-6">
            <p className="font-mono text-gray-700 dark:text-[#eef1f3]">
              {post.description}
            </p>
          </div>
          <div className="border-t border-gray-100 dark:border-slate-700 pt-6 flex items-center justify-between">
            <VoteBar
              id={id}
              initialVotes={post.upVotes - post.downVotes}
              initialUpVoted={user && post.upVotedUsers.includes(user._id)}
              initialDownVoted={user && post.downVotedUsers.includes(user._id)}
            />
            <button className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 dark:text-white transition-colors">
              <Share className="w-5 h-5" />
              <span className="font-mono text-sm">Share</span>
            </button>
          </div>

          <section className="mt-8">
            <h3 className="text-xl font-semibold mb-4 font-mono text-black dark:text-white">
              Comments
            </h3>
            <CommentThread
              post={post}
              comments={post.comments}
              onAddReply={handleAddReply}
              onDeleteComment={handleDeleteComment}
            />
          </section>
        </article>
      </div>
    </div>
  );
}

export default PostDetail;
