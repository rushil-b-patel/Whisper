import React, { useEffect, useMemo, useState } from "react";
import { Report, ThreeDots, Trash, Reply, Heart, HeartSolid } from "../ui/Icons";
import { usePostService } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";

// CommentItem component for individual comments
const CommentItem = ({ 
  comment, 
  postId, 
  depth = 0, 
  onDeleteComment, 
  onAddReply 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [option, setOption] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes || 0);
  const { deleteComment } = usePostService();
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await deleteComment(token, postId, commentId);
      if (response.success) {
        onDeleteComment(commentId);
        setOption(false);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };
  
  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    // Call parent function to add a reply
    onAddReply(comment._id, replyText);
    setReplyText("");
    setShowReplyForm(false);
  };
  
  const toggleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (option && !e.target.closest(`#popup-${comment._id}`)) {
        setOption(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [option, comment._id]);
  
  // Maximum depth for replies to prevent excessive nesting
  const maxDepth = 3;
  
  return (
    <div className={`comment-item ${depth > 0 ? 'pl-4 md:pl-8' : ''}`}>
      <div className={`flex justify-between bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 ${
        depth > 0 ? 'border-l-2 border-indigo-500/30 dark:border-indigo-500/50' : ''
      }`}>
        <div className="w-full">
          <div className="flex items-center mb-2">
            <img
              src={comment?.User?.userAvatar || "https://ui-avatars.com/api/?name=" + (comment?.User?.userName || "User")}
              alt="Commenter"
              className="w-8 h-8 rounded-full mr-3"
            />
            <div className="flex flex-col">
              <div className="flex items-center">
                <h4 className="font-mono text-sm font-semibold text-black dark:text-white">
                  {comment?.User?.userName || "User"}
                </h4>
                {depth > 0 && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                    Replying
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(comment?.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 font-mono mb-3">{comment.text}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={toggleLike} 
              className={`flex items-center gap-1 text-sm ${
                isLiked 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              } transition-colors`}
            >
              {isLiked ? <HeartSolid className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              <span>{likes}</span>
            </button>
            
            {depth < maxDepth && (
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)} 
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
          </div>
          
          {showReplyForm && (
            <div className="mt-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 transition-all font-mono resize-none text-sm"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim()}
                  className={`px-3 py-1 text-sm text-white rounded-lg transition-colors ${
                    replyText.trim() 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-indigo-400 cursor-not-allowed'
                  }`}
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative" id={`popup-${comment._id}`}>
          <button
            className="text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-400"
            onClick={() => setOption(!option)}
          >
            <ThreeDots />
          </button>
          {option && (
            <ul className="absolute right-0 z-20 bg-white dark:bg-gray-800 rounded shadow-lg hover:shadow-none text-black dark:text-white transition min-w-[120px]">
              <li>
                {user?._id === comment.User._id && 
                <div 
                  className="flex items-center cursor-pointer space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleDeleteComment(comment._id)}
                >
                  <Trash className="w-4 h-4" />
                  <button className="w-full text-sm text-left">
                    Delete
                  </button>
                </div>
                }
                <div className="flex items-center cursor-pointer space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Report className="w-4 h-4" />
                  <button
                    onClick={() => console.log("Reported comment")}
                    className="w-full text-sm text-left"
                  >
                    Report
                  </button>
                </div>
              </li>
            </ul>
          )}
        </div>
      </div>
      
      {/* Render replies if any */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onDeleteComment={onDeleteComment}
              onAddReply={onAddReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function Comment({ post, comments: initialComments, onDeleteComment }) {
  const [comments, setComments] = useState([]);
  const { addComment } = usePostService();
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  
  // Process comments to create a threaded structure
  useEffect(() => {
    if (!initialComments) return;
    
    // Create a map of parent comments and their replies
    const commentMap = {};
    const rootComments = [];
    
    // First pass: create map entries for all comments
    initialComments.forEach(comment => {
      const commentCopy = { ...comment, replies: [] };
      commentMap[comment._id] = commentCopy;
      
      // If no parentId, it's a root comment
      if (!comment.parentId) {
        rootComments.push(commentCopy);
      }
    });
    
    // Second pass: add replies to their parents
    initialComments.forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(commentMap[comment._id]);
      }
    });
    
    setComments(rootComments);
  }, [initialComments]);
  
  // Handler for adding a reply to a comment
  const handleAddReply = async (parentId, text) => {
    try {
      if (!token) {
        toast.error("Login to reply", { position: "bottom-right" });
        return;
      }
      
      // Add parentId to the request
      const response = await addComment(token, post._id, text, parentId);
      if (response.success) {
        // Update the local comments state to include the new reply
        const newComment = {
          ...response.comment,
          User: { _id: user._id, userName: user.userName },
          parentId
        };
        
        // Create updated comments structure
        const updatedComments = [...comments];
        
        // Helper function to add the reply to the correct parent comment
        const addReplyToComment = (commentsArray, parentId) => {
          for (let i = 0; i < commentsArray.length; i++) {
            if (commentsArray[i]._id === parentId) {
              if (!commentsArray[i].replies) {
                commentsArray[i].replies = [];
              }
              commentsArray[i].replies.unshift(newComment);
              return true;
            }
            if (commentsArray[i].replies && commentsArray[i].replies.length > 0) {
              if (addReplyToComment(commentsArray[i].replies, parentId)) {
                return true;
              }
            }
          }
          return false;
        };
        
        addReplyToComment(updatedComments, parentId);
        setComments(updatedComments);
      }
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };
  
  // Enhanced delete comment handler for threaded comments
  const handleDeleteComment = (commentId) => {
    // Helper function to remove a comment by ID
    const removeComment = (commentsArray, commentId) => {
      const updatedArray = commentsArray.filter(comment => comment._id !== commentId);
      
      // Also check replies of each comment
      updatedArray.forEach(comment => {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = removeComment(comment.replies, commentId);
        }
      });
      
      return updatedArray;
    };
    
    const updatedComments = removeComment(comments, commentId);
    setComments(updatedComments);
    
    // Call the parent onDeleteComment function
    if (onDeleteComment) {
      onDeleteComment(commentId);
    }
  };

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        comments.map(comment => (
          <CommentItem
            key={comment._id}
            comment={comment}
            postId={post._id}
            onDeleteComment={handleDeleteComment}
            onAddReply={handleAddReply}
          />
        ))
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}

export default Comment;