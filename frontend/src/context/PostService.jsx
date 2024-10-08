import axios from "axios";
import { useState } from "react";

const API = "http://localhost:8080";


export const usePostService = () => {
    
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

  const createPost = async (token, post) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/post/create-post`, token, post);
      return response.data;
    } catch (error) {
      console.error("create post failed", error);
      setError(error);
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
      console.error("get all posts failed", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserPosts = async (token, id) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/post/${id}`, token);
      return response.data;
    } catch (error) {
      console.error("get user post failed", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const upVotePost = async (token, id) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.put(`${API}/post/upvote/${id}`, token);
      return response.data;
    } catch (error) {
      console.error("upvote post failed", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const downVotePost = async (token, id) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.put(`${API}/post/downvote/${id}`, token);
      return response.data;
    } catch (error) {
      console.error("downvote post failed", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (token, id, text) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API}/post/add-comment/${id}`,
        token,
        text
      );
      return response.data;
    } catch (error) {
      console.error("add comment failed", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (token, id, post) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.put(`${API}/post/update/${id}`, token, post);
      return response.data;
    } catch (error) {
      console.error("update post failed", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

return{
    error,
    isLoading,
    createPost,
    getAllPosts,
    getUserPosts,
    upVotePost,
    downVotePost,
    addComment,
    updatePost
}

};
