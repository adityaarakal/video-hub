import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Pagination from '../components/Pagination';
import { Play } from 'lucide-react';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await api.search(query, 'videos', 20, currentPage);
        setSearchResults(results.results?.videos || []);
        setTotalResults(results.total || 0);
        setTotalPages(results.totalPages || 1);
        setHasMore(results.hasMore || false);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, currentPage]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
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

  const handleVideoClick = (video) => {
    navigate(`/?v=${video.id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="search-results-page">
      <div className="search-results-container">
        <div className="search-results-header">
          <h2>Search Results for "{query}"</h2>
          <span className="results-count">{totalResults.toLocaleString()} results</span>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="search-results-list">
            {searchResults.map((video) => (
              <div 
                key={video.id} 
                className="search-result-item"
                onClick={() => handleVideoClick(video)}
              >
                <div className="search-result-thumbnail">
                  {video.thumbnail && video.thumbnail.trim() !== '' ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="thumbnail-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="thumbnail-placeholder" style={{ display: (video.thumbnail && video.thumbnail.trim() !== '') ? 'none' : 'flex' }}>
                    <Play size={48} fill="currentColor" />
                  </div>
                  <span className="video-duration">
                    {video.duration ? (typeof video.duration === 'number' ? formatTime(video.duration) : video.duration) : '0:00'}
                  </span>
                </div>
                <div className="search-result-info">
                  <h3 className="search-result-title">{video.title}</h3>
                  <div className="search-result-meta">
                    <span className="search-result-channel">{video.channelName || video.channel}</span>
                    <span className="search-result-stats">
                      {typeof video.views === 'number' ? formatNumber(video.views) + ' views' : video.views} • {video.createdAt ? getTimeAgo(video.createdAt) : video.timeAgo || 'Unknown'}
                    </span>
                  </div>
                  <p className="search-result-description">
                    {video.description || 'Video description and details about the content...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No results found for "{query}"</p>
            <p className="no-results-suggestion">Try different keywords or check your spelling</p>
          </div>
        )}

        {!isLoading && searchResults.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            hasMore={hasMore}
          />
        )}
      </div>
    </div>
  );
};

export default SearchResults;

