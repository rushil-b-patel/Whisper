import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostService } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import VoteBar from '../components/VoteBar';
import CommentThread from '../components/Comment';
import { EditorRenderer } from '../components/Editor';
import { Bars, Trash, Save, ChevronLeft, Share, UnSave } from '../ui/Icons';

function PostDetail() {
  const { id } = useParams();
  const { getPost, deletePost, savePost } = usePostService();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await getPost(id);
        console.log(response);
        setPost(response.post);
        setComments(response.comments || []);
        setIsSaved(user?.savedPosts?.includes(response.post._id));
      } catch (err) {
        toast.error('Error fetching post');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchPost();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id, getPost, user?.savedPosts]);

  const handleSavePost = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Login to save post');
      return;
    }

    try {
      const res = await savePost(token, id);
      setIsSaved(res.isSaved);
      toast.success(res.message);
    } catch {
      toast.error('Failed to save/unsave post');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDeletePost = async () => {
    if (user?._id !== post?.user?._id) {
      toast.error('Unauthorized');
      return;
    }
    try {
      setIsLoading(true);
      await deletePost(localStorage.getItem('token'), id);
      toast.success('Post deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setIsLoading(false);
      setShowOptions(false);
    }
  };

  if (isLoading) return <div className="flex h-[90vh] justify-center items-center">Loading...</div>;
  if (!post) return <div className="text-center mt-10 text-gray-500">Post not found</div>;

  const isOwner = user?._id === post.user?._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1113] py-8 px-4">
      <button
        onClick={() => navigate('/')}
        className="text-indigo-600 dark:text-indigo-400 flex items-center mb-6"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span className="font-mono">Back</span>
      </button>

      <div className="max-w-4xl mx-auto bg-white dark:bg-[#1a1c1f] p-8 rounded-xl shadow">
        <header className="flex items-center mb-4">
          <img
            src={post?.avatar || `https://ui-avatars.com/api/?name=${post.user.userName}`}
            className="w-12 h-12 rounded-full ring-2 ring-indigo-300 dark:ring-indigo-700"
            alt="avatar"
          />
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {post.user.userName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {post.user.department || 'General'} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          {isOwner && (
            <div className="ml-auto relative" ref={dropdownRef}>
              <button
                onClick={() => setShowOptions((prev) => !prev)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <Bars className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-40 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden z-50">
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-600/20 transition-colors w-full"
                  >
                    <Trash className="w-4 h-4" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
          {post.title}
        </h1>

        {post.image && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img src={post.image} alt="Post" className="w-full object-cover" />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="mb-6">
          <EditorRenderer data={post.description} />
        </div>

        <div className="flex justify-between items-center border-t pt-6 dark:border-gray-700">
          <VoteBar
            postId={post._id}
            initialVotes={post.upVotes - post.downVotes}
            initialUpVoted={post.upVotedUsers.includes(user?._id)}
            initialDownVoted={post.downVotedUsers.includes(user?._id)}
          />
          <div className="flex gap-4">
            <button
              onClick={handleSavePost}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-white hover:text-indigo-600"
            >
              {isSaved ? <UnSave className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {isSaved ? 'Unsave' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-white hover:text-indigo-600"
            >
              <Share className="w-5 h-5" /> Share
            </button>
          </div>
        </div>

        <CommentThread post={post} comments={comments} />
      </div>
    </div>
  );
}

export default PostDetail;
