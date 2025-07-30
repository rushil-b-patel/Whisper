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

  const handleError = (error, message) => {
    const errMsg = error.response?.data?.message || message || 'An unexpected error occurred';
    console.error(errMsg, error);
    toast.error(errMsg, { position: 'bottom-right' });
    setError(errMsg);
    return errMsg;
  };

  const createPost = async (token, formData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/post/create-post`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Post created successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllPosts = async () => {
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
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/post/${id}`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to load post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upVotePost = async (token, id) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API}/post/upvote/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to upvote post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const downVotePost = async (token, id) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API}/post/downvote/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to downvote post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (token, id, text) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API}/post/add-comment/${id}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Comment added successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to add comment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (token, id, commentId) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`${API}/post/delete-comment/${id}/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Comment deleted');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to delete comment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (token, id) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`${API}/post/delete-post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Post deleted');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to delete post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const voteComment = async (token, postId, commentId, voteType) => {
    try {
      const response = await axios.put(
        `${API}/post/vote-comment/${postId}`,
        { voteType, commentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to vote on comment');
      throw error;
    }
  };

  const savePost = async (token, postId) => {
    try {
      const response = await axios.put(
        `${API}/post/save/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to save post');
      throw error;
    }
  };

  const getSavedPosts = async (token) => {
    try {
      const response = await axios.get(`${API}/post/saved-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to get saved posts');
      throw error;
    }
  };

  const getDepartments = async () => {
    try {
      const response = await axios.get(`${API}/stats/departments`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to load departments');
      throw error;
    }
  };

  const getUserStats = async (token) => {
    try {
      const response = await axios.get(`${API}/stats/user-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to load user stats');
      throw error;
    }
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
    getDepartments,
    getUserStats,
    error,
    isLoading,
  };
};
