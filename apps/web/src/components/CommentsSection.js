import React, { useState } from 'react';
import './CommentsSection.css';
import { ArrowUpDown, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';

const CommentsSection = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: '@Riyas009',
      avatar: 'R',
      timeAgo: '4 months ago',
      text: 'I am a Muslim from Kerala. Since my childhood, I have been listening to this spiritual mantra from a nearby Sri Narasimha temple. This brings back so many memories.',
      likes: 282,
      replies: 9,
      isLiked: false,
      isDisliked: false,
      showReplies: false
    },
    {
      id: 2,
      author: '@bharathjain1482',
      avatar: 'B',
      timeAgo: '2 years ago',
      text: 'South Indian people are very important to save culture, tradition and religion.',
      likes: 776,
      replies: 23,
      isLiked: false,
      isDisliked: false,
      showReplies: false
    },
    {
      id: 3,
      author: '@julesm7418',
      avatar: 'J',
      timeAgo: '4 years ago',
      text: 'I am a Catholic. My neighbor used to play this song every morning and it became a habit for me to listen to it. She is battling cancer now and I hope she fights like a warrior queen.',
      likes: 1400,
      replies: 37,
      isLiked: false,
      isDisliked: false,
      showReplies: false
    },
    {
      id: 4,
      author: '@mohamedfaizal2013',
      avatar: 'M',
      timeAgo: '2 years ago (edited)',
      text: 'I am a Muslim. When I was a child, I used to hear this song played in Hindu homes and temples. I miss those days.',
      likes: 283,
      replies: 11,
      isLiked: false,
      isDisliked: false,
      showReplies: false
    },
    {
      id: 5,
      author: '@musicbe11e',
      avatar: 'M',
      timeAgo: '2 months ago',
      text: 'I had a dream where my mother told me to listen to this song daily. I hope my life improves.',
      likes: 62,
      replies: 7,
      isLiked: false,
      isDisliked: false,
      showReplies: false
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState('Top comments');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);

  const totalComments = 8272;

  const handleLikeComment = (id) => {
    setComments(comments.map(comment => {
      if (comment.id === id) {
        if (comment.isLiked) {
          return { ...comment, isLiked: false, likes: comment.likes - 1 };
        } else {
          return { 
            ...comment, 
            isLiked: true, 
            isDisliked: false,
            likes: comment.likes + (comment.isDisliked ? 2 : 1)
          };
        }
      }
      return comment;
    }));
  };

  const handleDislikeComment = (id) => {
    setComments(comments.map(comment => {
      if (comment.id === id) {
        if (comment.isDisliked) {
          return { ...comment, isDisliked: false };
        } else {
          return { 
            ...comment, 
            isDisliked: true, 
            isLiked: false,
            likes: comment.likes - (comment.isLiked ? 2 : 1)
          };
        }
      }
      return comment;
    }));
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const newCommentObj = {
        id: comments.length + 1,
        author: '@user' + Math.floor(Math.random() * 1000),
        avatar: 'U',
        timeAgo: 'just now',
        text: newComment,
        likes: 0,
        replies: 0,
        isLiked: false,
        isDisliked: false,
        showReplies: false
      };
      setComments([newCommentObj, ...comments]);
      setNewComment('');
    }
  };

  const handleReply = (id) => {
    setReplyingTo(id);
  };

  const handleSubmitReply = (commentId) => {
    if (replyText.trim()) {
      alert(`Reply submitted: "${replyText}"`);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setShowSortMenu(false);
    // In a real app, this would sort the comments
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

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
          <div className="avatar-placeholder">A</div>
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
              <div className="avatar-placeholder">{comment.avatar}</div>
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
    </div>
  );
};

export default CommentsSection;

