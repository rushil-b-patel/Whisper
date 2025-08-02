import axios from 'axios';
import { useCallback } from 'react';
import { useRequest } from '../utils/useRequest.jsx';
import { showSuccess } from '../utils/toast.jsx';

const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_API_MOBILE = import.meta.env.VITE_BASE_API_MOBILE;
const API = /iphone|ipad|ipod|Android/i.test(navigator.userAgent) ? BASE_API_MOBILE : BASE_API;

export const usePostService = () => {
  const { execute, isLoading, error } = useRequest();

  const createPost = async (token, formData) => {
    return await execute(async () => {
      const res = await axios.post(`${API}/post/create-post`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      showSuccess('Post created');
      return res.data;
    }, 'Failed to create post');
  };

  const getAllPosts = async () => {
    return await execute(() => axios.get(`${API}/post`).then(res => res.data), 'Failed to load posts');
  };

  const getPost = useCallback(async (id) => {
    return await execute(() => axios.get(`${API}/post/${id}`).then(res => res.data), 'Failed to load post');
  }, []);

  const deletePost = async (token, id) => {
    return await execute(() =>
      axios.delete(`${API}/post/delete-post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        showSuccess('Post deleted');
        return res.data;
      }), 'Failed to delete post'
    );
  };

  const upVotePost = async (token, id) =>
    execute(() => axios.put(`${API}/post/upvote/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data), 'Failed to upvote');

  const downVotePost = async (token, id) =>
    execute(() => axios.put(`${API}/post/downvote/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data), 'Failed to downvote');

  const addComment = async (token, id, text) =>
    execute(() => axios.post(`${API}/comment/${id}`, { text }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      showSuccess('Comment added');
      return res.data;
    }), 'Failed to add comment');

  const deleteComment = async (token, postId, commentId) =>
    execute(() => axios.delete(`${API}/comment/${postId}/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      showSuccess('Comment deleted');
      return res.data;
    }), 'Failed to delete comment');

  const voteComment = async (token, postId, commentId, voteType) =>
    execute(() => axios.put(`${API}/comment/${postId}`, {
      commentId, voteType
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data), 'Failed to vote on comment');

  const savePost = async (token, postId) =>
    execute(() => axios.put(`${API}/post/save/${postId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data), 'Failed to save post');

  const getSavedPosts = async (token) =>
    execute(() => axios.get(`${API}/post/saved-posts`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data), 'Failed to fetch saved posts');

  const getUserStats = async (token) =>
    execute(() => axios.get(`${API}/stats/user-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data), 'Failed to fetch stats');

  const getDepartments = async () =>
    execute(() => axios.get(`${API}/departments`).then(res => res.data), 'Failed to fetch departments');

  const saveDepartment = async (token, name) =>
    execute(() => axios.post(`${API}/departments/add`, { name }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data), 'Failed to save department');

  const getPostsByDepartment = async (name) =>
    execute(() => axios.get(`${API}/departments/${name}/posts`).then(res => res.data), 'Failed to load department posts');

  return {
    createPost, getAllPosts, getPost, deletePost,
    upVotePost, downVotePost, addComment, deleteComment,
    voteComment, savePost, getSavedPosts,
    getUserStats, getDepartments, saveDepartment, getPostsByDepartment,
    isLoading, error
  };
};
