import axios from 'axios';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_API_MOBILE = import.meta.env.VITE_BASE_API_MOBILE;

const getBaseURI = () => {
  const isMobile = /iphone|ipad|ipod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    return BASE_API_MOBILE;
  }
  return BASE_API;
};

const API = getBaseURI();

const requestCache = new Map();
const pendingRequests = new Map();

const getCacheKey = (url, params = {}) => {
  return `${url}_${JSON.stringify(params)}`;
};

const createDedupedRequest = async (cacheKey, requestFn, ttl = 30000) => {
  if (requestCache.has(cacheKey)) {
    const { data, timestamp } = requestCache.get(cacheKey);
    if (Date.now() - timestamp < ttl) {
      return data;
    }
    requestCache.delete(cacheKey);
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const requestPromise = requestFn()
    .then((data) => {
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
      pendingRequests.delete(cacheKey);
      return data;
    })
    .catch((error) => {
      pendingRequest.delete(cacheKey);
      throw error;
    });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

export const usePostService = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error, customMessage) => {
    const errorMessage =
      error.response?.data?.message || customMessage || 'An unexpected error occurred';
    console.error(errorMessage, error);
    setError(errorMessage);
    toast.error(errorMessage, { position: 'bottom-right' });
    return errorMessage;
  };

  const createPost = async (token, formData) => {
    setError(null);
    setIsLoading(true);
    try {
      if (!token) {
        const msg = 'Authentication required. Please log in.';
        toast.error(msg, { position: 'bottom-right' });
        throw new Error(msg);
      }

      const response = await axios.post(`${API}/post/create-post`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post created successfully', { position: 'bottom-right' });

      const postsKey = getCacheKey(`${API}/post`);
      requestCache.delete(postsKey);

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
    const cacheKey = getCacheKey(`${API}/post`);

    try {
      const data = await createDedupedRequest(
        cacheKey,
        async () => {
          const response = await axios.get(`${API}/post`);
          return response.data;
        },
        60000
      );

      return data;
    } catch (error) {
      handleError(error, 'Failed to load posts');
      throw error;
    }
  };

  const getPost = useCallback(async (id) => {
    setError(null);
    const cacheKey = getCacheKey(`${API}/post/${id}`);

    try {
      if (!id) {
        const msg = 'Post ID is required';
        toast.error(msg, { position: 'bottom-right' });
        throw new Error(msg);
      }

      const data = await createDedupedRequest(
        cacheKey,
        async () => {
          const response = await axios.get(`${API}/post/${id}`);
          return response.data;
        },
        30000
      );

      return data;
    } catch (error) {
      handleError(error, 'Failed to load post');
      throw error;
    }
  }, []);

  const upVotePost = async (token, id) => {
    setError(null);
    setIsLoading(true);
    try {
      if (!token) {
        const msg = 'Authentication required. Please log in to vote.';
        toast.error(msg, { position: 'bottom-right' });
        throw new Error(msg);
      }

      const response = await axios.put(
        `${API}/post/upvote/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const postsKey = getCacheKey(`${API}/post`);
      const postKey = getCacheKey(`${API}/post/${id}`);
      requestCache.delete(postsKey);
      requestCache.delete(postKey);

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
      if (!token) {
        const msg = 'Authentication required. Please log in to vote.';
        toast.error(msg, { position: 'bottom-right' });
        throw new Error(msg);
      }

      const response = await axios.put(
        `${API}/post/downvote/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const postsKey = getCacheKey(`${API}/post`);
      const postKey = getCacheKey(`${API}/post/${id}`);
      requestCache.delete(postsKey);
      requestCache.delete(postKey);

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
      if (!token) {
        const msg = 'Authentication required. Please log in to comment.';
        toast.error(msg, { position: 'bottom-right' });
        throw new Error(msg);
      }

      if (!text || !text.trim()) {
        const msg = 'Comment text is required';
        toast.error(msg, { position: 'bottom-right' });
        throw new Error(msg);
      }

      const response = await axios.post(
        `${API}/post/add-comment/${id}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Comment added successfully', { position: 'bottom-right' });
      }

      const postsKey = getCacheKey(`${API}/post`);
      const postKey = getCacheKey(`${API}/post/${id}`);
      requestCache.delete(postsKey);
      requestCache.delete(postKey);

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
      if (!token || !id) {
        const msg = 'Missing required information to delete post';
        toast.error(msg, { position: 'bottom-right' });
        throw new Error(msg);
      }

      const response = await axios.delete(`${API}/post/delete-post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success(response.data.message || 'Post deleted successfully', {
          position: 'bottom-right',
        });
      }
      const postsKey = getCacheKey(`${API}/post`);
      const postKey = getCacheKey(`${API}/post/${id}`);
      requestCache.delete(postsKey);
      requestCache.delete(postKey);

      return response.data;
    } catch (error) {
      handleError(error, 'Failed to delete post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (token, id, commentId) => {
    setError(null);
    setIsLoading(true);
    try {
      if (!token || !id || !commentId) {
        const msg = 'Missing required information to delete comment';
        toast.error(msg, { position: 'bottom-right' });
        throw new Error(msg);
      }

      const response = await axios.delete(`${API}/post/delete-comment/${id}/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Comment deleted successfully', {
          position: 'bottom-right',
        });
      }
      const postsKey = getCacheKey(`${API}/post`);
      const postKey = getCacheKey(`${API}/post/${id}`);
      requestCache.delete(postsKey);
      requestCache.delete(postKey);

      return response.data;
    } catch (error) {
      handleError(error, 'Failed to delete comment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const voteComment = async (token, postId, commentId, voteType) => {
    const res = await axios.put(
      `${API}/post/vote-comment/${postId}`,
      {
        voteType,
        commentId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const postsKey = getCacheKey(`${API}/post`);
    const postKey = getCacheKey(`${API}/post/${postId}`);
    requestCache.delete(postsKey);
    requestCache.delete(postKey);

    return res.data;
  };

  const savePost = async (token, postId) => {
    if (!token) throw new Error('Authentication required');

    const response = await axios.put(
      `${API}/post/save/${postId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const statsKey = getCacheKey(`${API}/stats/user-stats`);
    requestCache.delete(statsKey);

    return response.data;
  };

  const getSavedPosts = async (token) => {
    if (!token) throw new Error('Authentication required');

    const cacheKey = getCacheKey(`${API}/post/saved-posts`, { token });

    const data = await createDedupedRequest(
      cacheKey,
      async () => {
        const response = await axios.get(`${API}/post/saved-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },
      30000
    );

    return data;
  };

  const getDepartments = async () => {
    setError(null);
    const cacheKey = getCacheKey(`${API}/stats/departments`);

    try {
      const data = await createDedupedRequest(
        cacheKey,
        async () => {
          const response = await axios.get(`${API}/stats/departments`);
          return response.data;
        },
        300000
      );

      return data;
    } catch (error) {
      handleError(error, 'Failed to load departments');
      throw error;
    }
  };

  const getUserStats = async (token) => {
    setError(null);
    const cacheKey = getCacheKey(`${API}/stats/user-stats`, { token });

    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      const data = await createDedupedRequest(
        cacheKey,
        async () => {
          const response = await axios.get(`${API}/stats/user-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return response.data;
        },
        60000
      );

      return data;
    } catch (error) {
      handleError(error, 'Failed to load user stats');
      throw error;
    }
  };

  const clearCache = () => {
    requestCache.clear();
    pendingRequests.clear();
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
    clearCache,
    error,
    isLoading,
  };
};
