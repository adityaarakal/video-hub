import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Video, Trash2, Edit, ArrowLeft, Loader2, Search } from 'lucide-react';
import './VideoList.css';

const VideoList = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadVideos();
  }, [page, searchTerm]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (searchTerm) {
        params.search = searchTerm;
      }
      const data = await api.getVideos(params);
      setVideos(data.videos || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await api.deleteVideo(videoId);
      loadVideos();
    } catch (error) {
      alert('Failed to delete video: ' + error.message);
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

  return (
    <div className="cms-page">
      <header className="cms-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            <ArrowLeft size={20} />
            Back
          </button>
          <h1>Manage Videos</h1>
        </div>
      </header>

      <div className="cms-content">
        <div className="video-list-container">
          <div className="list-header">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button onClick={() => navigate('/upload')} className="add-button">
              <Video size={20} />
              Upload Video
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <Loader2 size={32} className="spinner" />
              <p>Loading videos...</p>
            </div>
          ) : videos.length > 0 ? (
            <>
              <div className="videos-table">
                <table>
                  <thead>
                    <tr>
                      <th>Thumbnail</th>
                      <th>Title</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map(video => (
                      <tr key={video.id}>
                        <td>
                          <div className="thumbnail-cell">
                            {video.thumbnail && video.thumbnail.trim() !== '' ? (
                              <img src={video.thumbnail} alt={video.title} />
                            ) : (
                              <div className="thumbnail-placeholder">
                                <Video size={24} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="title-cell">
                            <strong>{video.title}</strong>
                            {video.description && (
                              <span className="description">{video.description.substring(0, 100)}...</span>
                            )}
                          </div>
                        </td>
                        <td>{formatNumber(video.views || 0)}</td>
                        <td>{formatNumber(video.likes || 0)}</td>
                        <td>{formatDate(video.createdAt)}</td>
                        <td>
                          <div className="actions-cell">
                            <button
                              onClick={() => handleDelete(video.id)}
                              className="action-btn delete"
                              title="Delete video"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <Video size={48} />
              <p>No videos found</p>
              <button onClick={() => navigate('/upload')} className="add-button">
                Upload Your First Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoList;

