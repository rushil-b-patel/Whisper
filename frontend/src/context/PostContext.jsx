import axios from 'axios';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_API_MOBILE = import.meta.env.VITE_BASE_API_MOBILE;

const getBaseURI = () => {
  const isMobile = /iphone|ipad|ipod|Android/i.test(navigator.userAgent);
  return isMobile ? BASE_API_MOBILE : BASE_API;
};

const API = getBaseURI();

export const usePostService = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error, customMessage) => {
    const errorMessage = error.response?.data?.message || customMessage || 'An unexpected error occurred';
    console.error(errorMessage, error);
    setError(errorMessage);
    toast.error(errorMessage, { position: 'bottom-right' });
    return errorMessage;
  };

  const createPost = async (token, formData) => {
    setError(null);
    setIsLoading(true);
    try {
      if (!token) throw new Error('Authentication required. Please log in.');

      const response = await axios.post(`${API}/post/create-post`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post created successfully', { position: 'bottom-right' });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllPosts = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/post`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to load posts');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPost = useCallback(async (id) => {
    setError(null);
    setIsLoading(true);
    try {
      const postId = parseInt(id);
      if (isNaN(postId)) throw new Error('Invalid Post ID');

      const response = await axios.get(`${API}/post/${postId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to load post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upVotePost = async (token, id) => {
    setError(null);
    setIsLoading(true);
    try {
      if (!token) throw new Error('Authentication required. Please log in to vote.');

      const postId = parseInt(id);
      const response = await axios.put(`${API}/post/upvote/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      handleError(error, 'Failed to upvote post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const downVotePost = async (token, id) => {
    setError(null);
    setIsLoading(true);
    try {
      if (!token) throw new Error('Authentication required. Please log in to vote.');

      const postId = parseInt(id);
      const response = await axios.put(`${API}/post/downvote/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      handleError(error, 'Failed to downvote post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (token, id, text) => {
    setError(null);
    setIsLoading(true);
    try {
      if (!token) throw new Error('Authentication required. Please log in to comment.');
      if (!text?.trim()) throw new Error('Comment text is required');

      const postId = parseInt(id);
      const response = await axios.post(`${API}/post/add-comment/${postId}`, { text }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success('Comment added successfully', { position: 'bottom-right' });
      }

      return response.data;
    } catch (error) {
      handleError(error, 'Failed to add comment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (token, id) => {
    setError(null);
    setIsLoading(true);
    try {
      const postId = parseInt(id);
      if (!token || isNaN(postId)) throw new Error('Missing or invalid post ID');

      const response = await axios.delete(`${API}/post/delete-post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Post deleted successfully', {
          position: 'bottom-right',
        });
      }

      return response.data;
    } catch (error) {
      handleError(error, 'Failed to delete post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (token, postId, commentId) => {
    setError(null);
    setIsLoading(true);
    try {
      const pid = parseInt(postId);
      const cid = parseInt(commentId);
      if (!token || isNaN(pid) || isNaN(cid)) throw new Error('Invalid post or comment ID');

      const response = await axios.delete(`${API}/post/delete-comment/${pid}/${cid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Comment deleted successfully', {
          position: 'bottom-right',
        });
      }

      return response.data;
    } catch (error) {
      handleError(error, 'Failed to delete comment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const voteComment = async (token, postId, commentId, voteType) => {
    const pid = parseInt(postId);
    const cid = parseInt(commentId);
    const res = await axios.put(`${API}/post/vote-comment/${pid}`, {
      voteType,
      commentId: cid,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const savePost = async (token, postId) => {
    const pid = parseInt(postId);
    if (!token || isNaN(pid)) throw new Error('Authentication or valid postId required');
    const response = await axios.put(`${API}/post/save/${pid}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  };

  const getSavedPosts = async (token) => {
    if (!token) throw new Error('Authentication required');
    const response = await axios.get(`${API}/post/saved-posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  };

  return {
    createPost,
    getAllPosts,
    getPost,
    upVotePost,
    downVotePost,
    addComment,
    deletePost,
    deleteComment,
    voteComment,
    savePost,
    getSavedPosts,
    error,
    isLoading,
  };
};
