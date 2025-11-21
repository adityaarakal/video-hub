const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('videohub_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('videohub_token', token);
    } else {
      localStorage.removeItem('videohub_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Request failed');
      }

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      // Re-throw with more context
      if (error.message) {
        throw error;
      }
      throw new Error(error.message || 'Network error. Please check if the server is running.');
    }
  }

  // Videos
  async getVideos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/videos${queryString ? `?${queryString}` : ''}`);
  }

  async getVideo(id) {
    try {
      const response = await this.request(`/videos/${id}`);
      // Handle both direct video object and wrapped response
      if (response.error) {
        throw new Error(response.error);
      }
      return response.video || response;
    } catch (error) {
      console.error(`Failed to get video ${id}:`, error);
      throw error;
    }
  }

  async createVideo(videoData) {
    return this.request('/videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  }

  async updateVideo(id, updates) {
    return this.request(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteVideo(id) {
    return this.request(`/videos/${id}`, {
      method: 'DELETE',
    });
  }

  async likeVideo(id, action = 'like') {
    return this.request(`/videos/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async dislikeVideo(id, action = 'dislike') {
    return this.request(`/videos/${id}/dislike`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  // Comments
  async getComments(videoId, sortBy = 'top', limit = 20, page = 1) {
    return this.request(`/comments?videoId=${videoId}&sortBy=${sortBy}&limit=${limit}&page=${page}`);
  }

  async createComment(commentData) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async updateComment(id, updates) {
    return this.request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteComment(id) {
    return this.request(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  async likeComment(id, action = 'like') {
    return this.request(`/comments/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async dislikeComment(id, action = 'dislike') {
    return this.request(`/comments/${id}/dislike`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async replyToComment(id, replyData) {
    return this.request(`/comments/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  }

  // Channels
  async getChannels() {
    return this.request('/channels');
  }

  async getChannel(id) {
    return this.request(`/channels/${id}`);
  }

  async getChannelVideos(channelId, limit = 20, page = 1) {
    return this.request(`/channels/${channelId}/videos?limit=${limit}&page=${page}`);
  }

  async checkSubscription(channelId, userId) {
    return this.request(`/channels/${channelId}/subscribed?userId=${userId}`);
  }

  async subscribeToChannel(channelId, userId) {
    return this.request(`/channels/${channelId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async unsubscribeFromChannel(channelId, userId) {
    return this.request(`/channels/${channelId}/subscribe?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  // Recommended Videos
  async getRecommendedVideos(videoId, limit = 10) {
    return this.request(`/videos/recommended?videoId=${videoId}&limit=${limit}`);
  }

  // Playlists
  async getPlaylists(userId) {
    return this.request(`/playlists?userId=${userId}`);
  }

  async getPlaylist(id) {
    return this.request(`/playlists/${id}`);
  }

  async initializeDefaultPlaylists(userId) {
    return this.request('/playlists/initialize', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async createPlaylist(playlistData) {
    return this.request('/playlists', {
      method: 'POST',
      body: JSON.stringify(playlistData),
    });
  }

  async updatePlaylist(id, updates) {
    return this.request(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePlaylist(id) {
    return this.request(`/playlists/${id}`, {
      method: 'DELETE',
    });
  }

  async addVideoToPlaylist(playlistId, videoData) {
    return this.request(`/playlists/${playlistId}/videos`, {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  }

  async removeVideoFromPlaylist(playlistId, videoId) {
    return this.request(`/playlists/${playlistId}/videos/${videoId}`, {
      method: 'DELETE',
    });
  }

  // Users
  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async getWatchHistory(userId) {
    return this.request(`/users/${userId}/history`);
  }

  async addToWatchHistory(userId, videoData) {
    return this.request(`/users/${userId}/history`, {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  }

  async clearWatchHistory(userId) {
    return this.request(`/users/${userId}/history`, {
      method: 'DELETE',
    });
  }

  async getUserSubscriptions(userId) {
    return this.request(`/users/${userId}/subscriptions`);
  }

  // Search
  async search(query, type = 'all', limit = 20, page = 1) {
    return this.request(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&page=${page}`);
  }

  // Auth
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Upload
  async uploadVideo(formData, onProgress) {
    const url = `${this.baseURL}/upload/video`;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', url);
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }
      xhr.send(formData);
    });
  }

  async uploadThumbnail(formData) {
    const url = `${this.baseURL}/upload/thumbnail`;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', url);
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }
      xhr.send(formData);
    });
  }
}

export default new ApiService();

