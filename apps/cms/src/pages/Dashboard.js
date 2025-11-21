import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, Video, LogOut, BarChart3, Loader2 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getVideos({ limit: 1000 });
      const videos = data.videos || [];
      
      setStats({
        totalVideos: videos.length,
        totalViews: videos.reduce((sum, v) => sum + (v.views || 0), 0),
        totalLikes: videos.reduce((sum, v) => sum + (v.likes || 0), 0),
        recentVideos: videos
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>VideoHub CMS</h1>
          <div className="header-actions">
            <span className="user-info">{user?.email}</span>
            <button onClick={onLogout} className="logout-button">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <Link to="/dashboard" className="nav-item active">
            <BarChart3 size={20} />
            Dashboard
          </Link>
          <Link to="/upload" className="nav-item">
            <Upload size={20} />
            Upload Video
          </Link>
          <Link to="/videos" className="nav-item">
            <Video size={20} />
            Manage Videos
          </Link>
        </nav>

        <main className="dashboard-main">
          <h2>Dashboard</h2>

          {loading ? (
            <div className="loading-container">
              <Loader2 size={32} className="spinner" />
              <p>Loading statistics...</p>
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Videos</h3>
                  <p className="stat-value">{stats?.totalVideos || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Views</h3>
                  <p className="stat-value">{formatNumber(stats?.totalViews || 0)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Likes</h3>
                  <p className="stat-value">{formatNumber(stats?.totalLikes || 0)}</p>
                </div>
              </div>

              <div className="recent-videos-section">
                <h3>Recent Videos</h3>
                {stats?.recentVideos && stats.recentVideos.length > 0 ? (
                  <div className="recent-videos-list">
                    {stats.recentVideos.map(video => (
                      <div key={video.id} className="recent-video-item">
                        <div className="video-info">
                          <h4>{video.title}</h4>
                          <p>{formatNumber(video.views || 0)} views</p>
                        </div>
                        <button
                          onClick={() => navigate(`/videos`)}
                          className="view-button"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No videos yet. Upload your first video!</p>
                )}
              </div>

              <div className="quick-actions">
                <Link to="/upload" className="action-button primary">
                  <Upload size={24} />
                  Upload New Video
                </Link>
                <Link to="/videos" className="action-button">
                  <Video size={24} />
                  Manage All Videos
                </Link>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

