import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePostService } from "../context/PostContext";
import { ChevronLeft, Share2, Bookmark} from "lucide-react";
import VoteBar from "../components/voteBar";
import toast from "react-hot-toast";
import Comment from "../components/Comment";

function PostDetail() {
  const { id } = useParams();
  const { getPost, addComment } = usePostService();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getPost(id);
        setPost(response.post);
        setComments(response.post.comments || []);
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
  }, [id]);

  const handleComment = async (event) =>{
    event.preventDefault();
    setError(null);
    try{
      const token = localStorage.getItem("token");
      if(!token){
        toast.error("Login to comment",{
          position:"bottom-right"
        })
        throw new Error("Login to comment");
      }
      if(comment.trim().length === 0){
        toast.error("Comment cannot be empty",{
          position:"bottom-right"
        })
        return;
      }
      console.log("Adding comment", comment);
      const response = await addComment(token, id, comment);
      if(response.success){
        setComments((prevComments) => [comment, ...prevComments]);
        setComment("");
        console.log("Comment added", response);
      }
    }
    catch(err){
      console.error("Error adding comment:", err);
      setError(err.message || "Failed to add comment");
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading post...</div>
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
            <h1 className="text-3xl font-bold mb-4 font-mono text-indigo-600 bg-clip-text dark:text-indigo-400">
              {post?.title}
            </h1>

            {post?.image && (
              <div className="relative mb-6 rounded-xl overflow-hidden group">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full object-cover rounded-xl"
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
                <VoteBar id={id} />
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
              <h3 className="mt-3 text-lg font-semibold font-sans text-black dark:text-white">
                Comments
              </h3>
              <div className="mb-6 mt-3">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 transition-all font-mono resize-none"
                  rows={1}
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                />
                <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-sans font-semibold text-sm"
                    onClick={handleComment}
                >
                  {isLoading ? "Posting..." : "Post Comment"}
                </button>
              </div>

                  <Comment post={post} comments={comments} setComments={setComments} />
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;