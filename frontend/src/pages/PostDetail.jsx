import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostService } from '../context/PostContext';
import VoteBar from '../components/VoteBar';
import toast from 'react-hot-toast';
import Comment from '../components/Comment';
import { useAuth } from '../context/AuthContext';
import { Bars, Trash, Save, ChevronLeft, Share } from '../ui/Icons';
import { EditorRenderer } from '../components/Editor';

function PostDetail() {
  const { id } = useParams();
  const { getPost, deletePost, deleteComment } = usePostService();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await getPost(id);
        setPost(response.post);
        setComments(response.post.comments || []);
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id, getPost]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

  const handleSavePost = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Login to save post', { position: 'bottom-right' });
      return;
    }
    toast.success('Post saved', { position: 'bottom-right' });
    setShowOptions(false);
  };

  const handleDeletePost = async () => {
    const token = localStorage.getItem('token');
    if (!token || user?._id !== post?.user?._id) {
      toast.error('Unauthorized', { position: 'bottom-right' });
      return;
    }

    try {
      setIsLoading(true);
      try {
        await deletePost(token, id);
        navigate('/');
        toast.success('Post deleted', { position: 'bottom-right' });
      } catch (error) {
        toast.error('Failed to delete post', { position: 'bottom-right' });
      }
    } catch (err) {
      toast.error('Failed to delete post', { position: 'bottom-right' });
    } finally {
      setIsLoading(false);
      setShowOptions(false);
    }
  };

  const handleDeleteComment = useCallback(
    async (commentId) => {
      const token = localStorage.getItem('token');
      try {
        await deleteComment(token, id, commentId);
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } catch {
        toast.error('Failed to delete comment', { position: 'bottom-right' });
      }
    },
    [id, deleteComment]
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4em)] justify-center items-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-[calc(100vh-4em)] flex items-center justify-center text-gray-500 dark:bg-[#0e1113]">
        Post not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1113] py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span className="font-mono">Back</span>
      </button>

      <div className="max-w-4xl mx-auto bg-white dark:bg-[#1a1c1f] rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-[#2A2B30]">
        <header className="flex items-center">
          <img
            src={post?.avatar || `https://ui-avatars.com/api/?name=${post.user.userName}`}
            alt="avatar"
            className="w-12 h-12 rounded-full ring-2 ring-indigo-200 dark:ring-indigo-900"
          />
          <div className="ml-4">
            <h2 className="text-lg font-semibold font-mono text-gray-900 dark:text-white">
              {post?.user?.userName || 'Unknown'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {post.user?.department || 'General'} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          {user?._id === post.user?._id && (
            <div className="ml-auto relative" ref={dropdownRef}>
              <button
                onClick={() => setShowOptions((prev) => !prev)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bars className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md z-50">
                  <button
                    onClick={handleSavePost}
                    className="flex items-center px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <article className="mt-6">
          <h1 className="text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mb-4">
            {post.title}
          </h1>

          {post.image && (
            <div className="mb-6 overflow-hidden rounded-xl">
              <img src={post.image} alt="Post attachment" className="w-full object-cover" />
            </div>
          )}

          <p className="text-gray-800 dark:text-gray-200 font-mono mb-6 leading-relaxed">
            <EditorRenderer data={post.description} />
          </p>

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

          <section className="mt-10">
            <Comment post={post} comments={comments} onDeleteComment={handleDeleteComment} />
          </section>
        </article>
      </div>
    </div>
  );
}

export default PostDetail;
