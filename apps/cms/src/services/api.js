const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('cms_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('cms_token', token);
    } else {
      localStorage.removeItem('cms_token');
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
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Request failed');
      }

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          const validationMessages = data.details.map(d => d.message).join(', ');
          const error = new Error(validationMessages || data.error || `Request failed with status ${response.status}`);
          error.status = response.status;
          error.details = data.details;
          throw error;
        }
        const error = new Error(data.error || `Request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      if (error.message) {
        if (error.status) {
          const newError = new Error(error.message);
          newError.status = error.status;
          if (error.details) {
            newError.details = error.details;
          }
          throw newError;
        }
        throw error;
      }
      throw new Error(error.message || 'Network error. Please check if the server is running.');
    }
  }

  // Auth
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

  // Videos
  async getVideos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/videos${queryString ? `?${queryString}` : ''}`);
  }

  async getVideo(id) {
    return this.request(`/videos/${id}`);
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
}

export default new ApiService();

