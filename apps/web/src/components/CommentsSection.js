import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Pagination from './Pagination';
import './CommentsSection.css';
import { ArrowUpDown, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';

const CommentsSection = ({ videoId }) => {
  const { user } = useApp();
  const { error: showError, success: showSuccess, warning: showWarning } = useToast();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState('Top comments');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      if (!videoId) return;
      
      setLoading(true);
      try {
        const sortType = sortBy === 'Newest first' ? 'newest' : 'top';
        const data = await api.getComments(videoId, sortType, 20, currentPage);
        const formattedComments = (data.comments || []).map(comment => ({
          ...comment,
          isLiked: false,
          isDisliked: false,
          showReplies: false,
          timeAgo: comment.createdAt ? getTimeAgo(comment.createdAt) : 'Unknown'
        }));
        setComments(formattedComments);
        setTotalComments(data.total || formattedComments.length);
        setTotalPages(data.totalPages || 1);
        setHasMore(data.hasMore || false);
      } catch (error) {
        console.error('Failed to load comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [videoId, sortBy, currentPage]);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const handleLikeComment = async (id) => {
    if (!user) {
      showWarning('Please login to like comments', 3000);
      return;
    }
    
    try {
      const comment = comments.find(c => c.id === id);
      const action = comment?.isLiked ? 'unlike' : 'like';
      const updated = await api.likeComment(id, action);
      
      setComments(comments.map(c => 
        c.id === id ? { ...c, ...updated, isLiked: !c.isLiked, isDisliked: false } : c
      ));
    } catch (error) {
      console.error('Failed to like comment:', error);
      showError('Failed to like comment', 3000);
    }
  };

  const handleDislikeComment = async (id) => {
    if (!user) {
      showWarning('Please login to dislike comments', 3000);
      return;
    }
    
    try {
      const comment = comments.find(c => c.id === id);
      const action = comment?.isDisliked ? 'undislike' : 'dislike';
      const updated = await api.dislikeComment(id, action);
      
      setComments(comments.map(c => 
        c.id === id ? { ...c, ...updated, isDisliked: !c.isDisliked, isLiked: false } : c
      ));
    } catch (error) {
      console.error('Failed to dislike comment:', error);
      showError('Failed to dislike comment', 3000);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showWarning('Please login to comment', 3000);
      return;
    }
    
    if (newComment.trim() && videoId) {
      try {
        const newCommentObj = await api.createComment({
          videoId,
          text: newComment,
          author: user.username || `@user${user.id}`,
          avatar: user.avatar || user.username?.charAt(0).toUpperCase() || 'U'
        });
        
        setComments([{
          ...newCommentObj,
          isLiked: false,
          isDisliked: false,
          showReplies: false,
          timeAgo: 'just now'
        }, ...comments]);
        setNewComment('');
        setTotalComments(totalComments + 1);
        showSuccess('Comment posted successfully!', 2000);
      } catch (error) {
        console.error('Failed to submit comment:', error);
        showError('Failed to submit comment. Please try again.', 4000);
      }
    }
  };

  const handleReply = (id) => {
    if (!user) {
      showWarning('Please login to reply', 3000);
      return;
    }
    setReplyingTo(id);
  };

  const handleSubmitReply = async (commentId) => {
    if (replyText.trim()) {
      try {
        await api.replyToComment(commentId, {
          text: replyText,
          author: user.username || `@user${user.id}`,
          avatar: user.avatar || user.username?.charAt(0).toUpperCase() || 'U'
        });
        
        // Reload comments to get updated reply count
        const data = await api.getComments(videoId, sortBy === 'Newest first' ? 'newest' : 'top', 20, currentPage);
        const formattedComments = (data.comments || []).map(comment => ({
          ...comment,
          isLiked: false,
          isDisliked: false,
          showReplies: false,
          timeAgo: comment.createdAt ? getTimeAgo(comment.createdAt) : 'Unknown'
        }));
        setComments(formattedComments);
        setTotalPages(data.totalPages || 1);
        setHasMore(data.hasMore || false);
        
        setReplyText('');
        setReplyingTo(null);
        showSuccess('Reply posted successfully!', 2000);
      } catch (error) {
        console.error('Failed to submit reply:', error);
        showError('Failed to submit reply. Please try again.', 4000);
      }
    }
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setShowSortMenu(false);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="comments-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h2 className="comments-count">{totalComments.toLocaleString()} Comments</h2>
        <div className="sort-by">
          <div className="sort-menu-wrapper">
            <button 
              className="sort-button"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <ArrowUpDown size={16} />
              <span>Sort by</span>
            </button>
            {showSortMenu && (
              <div className="sort-dropdown">
                <button 
                  className={`sort-option ${sortBy === 'Top comments' ? 'active' : ''}`}
                  onClick={() => handleSort('Top comments')}
                >
                  Top comments
                </button>
                <button 
                  className={`sort-option ${sortBy === 'Newest first' ? 'active' : ''}`}
                  onClick={() => handleSort('Newest first')}
                >
                  Newest first
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <form className="add-comment" onSubmit={handleSubmitComment}>
        <div className="comment-avatar">
          <div className="avatar-placeholder">{user?.avatar || user?.username?.charAt(0).toUpperCase() || 'A'}</div>
        </div>
        <div className="comment-input-wrapper">
          <input 
            type="text" 
            className="comment-input" 
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => setIsCommentFocused(true)}
            onBlur={() => setTimeout(() => setIsCommentFocused(false), 200)}
          />
          {(isCommentFocused || newComment) && (
            <div className="comment-actions">
              <button 
                type="button"
                className="cancel-button"
                onClick={() => {
                  setNewComment('');
                  setIsCommentFocused(false);
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="comment-button"
                disabled={!newComment.trim()}
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </form>
      
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-avatar">
              <div className="avatar-placeholder">{comment.avatar || comment.author?.charAt(0).toUpperCase() || 'U'}</div>
            </div>
            <div className="comment-content">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-time">{comment.timeAgo}</span>
              </div>
              <div className="comment-text">{comment.text}</div>
              <div className="comment-actions-bar">
                <button 
                  className={`comment-action-button ${comment.isLiked ? 'active' : ''}`}
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <ThumbsUp size={16} />
                </button>
                <span className="comment-likes">{formatNumber(comment.likes)}</span>
                <button 
                  className={`comment-action-button dislike ${comment.isDisliked ? 'active' : ''}`}
                  onClick={() => handleDislikeComment(comment.id)}
                >
                  <ThumbsDown size={16} />
                </button>
                <button 
                  className="reply-button"
                  onClick={() => handleReply(comment.id)}
                >
                  Reply
                </button>
              </div>
              {replyingTo === comment.id && (
                <div className="reply-input-wrapper">
                  <input
                    type="text"
                    className="reply-input"
                    placeholder="Add a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoFocus
                  />
                  <div className="reply-actions">
                    <button 
                      type="button"
                      className="cancel-button"
                      onClick={() => { setReplyingTo(null); setReplyText(''); }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="comment-button"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyText.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
              {comment.replies > 0 && (
                <button 
                  className="view-replies"
                  onClick={() => {
                    setComments(comments.map(c => 
                      c.id === comment.id ? { ...c, showReplies: !c.showReplies } : c
                    ));
                  }}
                >
                  {comment.showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span>{comment.replies} replies</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          hasMore={hasMore}
        />
      )}
    </div>
  );
};

export default CommentsSection;

