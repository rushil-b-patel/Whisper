import axios from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

const API = "http://localhost:8080";


export const usePostService = () => {
    
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

  const createPost = async (token, formData) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/post/create-post`, formData, 
            { 
              headers: 
                {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                }
            });
      toast.success("Post created successfully");
      return response.data;
    } catch (error) {
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
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPost = useCallback(async (id) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/post/${id}`);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upVotePost = async (token, id) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.put(`${API}/post/upvote/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
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
      const response = await axios.put(`${API}/post/downvote/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
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
      const response = await axios.post(`${API}/post/add-comment/${id}`, { text }, { headers: { "Authorization": `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (token, id, commentId) =>{
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.delete(`${API}/post/delete-comment/${id}/${commentId}`, { headers: { "Authorization": `Bearer ${token}` } });
      if(response.data.success){
        toast.success(response.data.message || "Comment deleted successfully");
      }
      return response.data;
    } catch (error) {
      setError(error);
      toast.error(error.response?.data?.message || "Error deleting comment");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }
  return{ error, isLoading, setError, setIsLoading, createPost, getAllPosts, getPost, upVotePost, downVotePost, addComment, deleteComment }

};
