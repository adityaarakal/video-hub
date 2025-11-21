import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { 
  BarChart3, 
  Video, 
  Users, 
  MessageSquare, 
  Trash2, 
  Shield, 
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [videoPage, setVideoPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);
  const [videoPagination, setVideoPagination] = useState({});
  const [userPagination, setUserPagination] = useState({});
  const [commentPagination, setCommentPagination] = useState({});

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      showError('Admin access required');
      navigate('/');
      return;
    }

    if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'videos') {
      loadVideos();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'comments') {
      loadComments();
    }
  }, [activeTab, videoPage, userPage, commentPage, searchTerm]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (error) {
      showError(error.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminVideos({ page: videoPage, limit: 20, search: searchTerm });
      setVideos(data.videos || []);
      setVideoPagination(data);
    } catch (error) {
      showError(error.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers({ page: userPage, limit: 20, search: searchTerm });
      setUsers(data.users || []);
      setUserPagination(data);
    } catch (error) {
      showError(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminComments({ page: commentPage, limit: 20 });
      setComments(data.comments || []);
      setCommentPagination(data);
    } catch (error) {
      showError(error.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This will also delete all associated comments.')) {
      return;
    }

    try {
      await api.deleteAdminVideo(videoId);
      showSuccess('Video deleted successfully');
      loadVideos();
    } catch (error) {
      showError(error.message || 'Failed to delete video');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      showSuccess(`User role updated to ${newRole}`);
      loadUsers();
    } catch (error) {
      showError(error.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.deleteAdminUser(userId);
      showSuccess('User deleted successfully');
      loadUsers();
    } catch (error) {
      showError(error.message || 'Failed to delete user');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.deleteAdminComment(commentId);
      showSuccess('Comment deleted successfully');
      loadComments();
    } catch (error) {
      showError(error.message || 'Failed to delete comment');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage your VideoHub platform</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={20} />
          Statistics
        </button>
        <button
          className={`admin-tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          <Video size={20} />
          Videos
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={20} />
          Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare size={20} />
          Comments
        </button>
      </div>

      <div className="admin-content">
        {loading && (
          <div className="admin-loading">
            <Loader2 size={32} className="spinner" />
            <p>Loading...</p>
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Videos</h3>
              <p className="stat-value">{stats.totalVideos}</p>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Views</h3>
              <p className="stat-value">{formatNumber(stats.totalViews)}</p>
            </div>
            <div className="stat-card">
              <h3>Total Likes</h3>
              <p className="stat-value">{formatNumber(stats.totalLikes)}</p>
            </div>
            <div className="stat-card">
              <h3>Total Comments</h3>
              <p className="stat-value">{stats.totalComments}</p>
            </div>
            <div className="stat-card">
              <h3>Total Channels</h3>
              <p className="stat-value">{stats.totalChannels}</p>
            </div>

            <div className="recent-videos">
              <h2>Recent Videos</h2>
              {stats.recentVideos && stats.recentVideos.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Views</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentVideos.map(video => (
                      <tr key={video.id}>
                        <td>{video.title}</td>
                        <td>{formatNumber(video.views)}</td>
                        <td>{formatDate(video.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No videos yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="admin-section">
            <div className="admin-search">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {videos.length > 0 ? (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Channel</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map(video => (
                      <tr key={video.id}>
                        <td>{video.title}</td>
                        <td>{video.channelName}</td>
                        <td>{formatNumber(video.views || 0)}</td>
                        <td>{formatNumber(video.likes || 0)}</td>
                        <td>{formatDate(video.createdAt)}</td>
                        <td>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => handleDeleteVideo(video.id)}
                            title="Delete video"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {videoPagination.totalPages > 1 && (
                  <div className="admin-pagination">
                    <button
                      onClick={() => setVideoPage(p => Math.max(1, p - 1))}
                      disabled={videoPage === 1}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <span>Page {videoPage} of {videoPagination.totalPages}</span>
                    <button
                      onClick={() => setVideoPage(p => Math.min(videoPagination.totalPages, p + 1))}
                      disabled={videoPage === videoPagination.totalPages}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="admin-empty">No videos found</p>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="admin-search">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {users.length > 0 ? (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={user.role || 'user'}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                            className="role-select"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete user"
                          >
                            <UserX size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {userPagination.totalPages > 1 && (
                  <div className="admin-pagination">
                    <button
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <span>Page {userPage} of {userPagination.totalPages}</span>
                    <button
                      onClick={() => setUserPage(p => Math.min(userPagination.totalPages, p + 1))}
                      disabled={userPage === userPagination.totalPages}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="admin-empty">No users found</p>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="admin-section">
            {comments.length > 0 ? (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Author</th>
                      <th>Comment</th>
                      <th>Video ID</th>
                      <th>Likes</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map(comment => (
                      <tr key={comment.id}>
                        <td>{comment.author}</td>
                        <td className="comment-text">{comment.text}</td>
                        <td>{comment.videoId}</td>
                        <td>{formatNumber(comment.likes || 0)}</td>
                        <td>{formatDate(comment.createdAt)}</td>
                        <td>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Delete comment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {commentPagination.totalPages > 1 && (
                  <div className="admin-pagination">
                    <button
                      onClick={() => setCommentPage(p => Math.max(1, p - 1))}
                      disabled={commentPage === 1}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <span>Page {commentPage} of {commentPagination.totalPages}</span>
                    <button
                      onClick={() => setCommentPage(p => Math.min(commentPagination.totalPages, p + 1))}
                      disabled={commentPage === commentPagination.totalPages}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="admin-empty">No comments found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

