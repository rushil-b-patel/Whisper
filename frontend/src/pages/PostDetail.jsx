import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePostService } from "../context/PostContext";
import PostCard from "../ui/PostCard";

function PostDetail() {
  const { id } = useParams();
  const { getPost } = usePostService();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("PostDetail useEffect triggered with ID:", id);
    
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Attempting to fetch post with ID:", id);
        const postData = await getPost(id);
        console.log("Received post data:", postData.post);
        
        if (!postData) {
          throw new Error("No post data received");
        }
        
        setPost(postData.post);
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
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
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
    <PostCard key={post._id} post={post} />
  );
}

export default PostDetail;
