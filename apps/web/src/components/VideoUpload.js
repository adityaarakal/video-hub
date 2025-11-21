import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import './VideoUpload.css';

const VideoUpload = ({ onClose }) => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    channelId: '',
    channelName: '',
    tags: '',
    videoFile: null,
    thumbnailFile: null
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.channelId.trim()) {
      newErrors.channelId = 'Channel ID is required';
    }
    if (!formData.channelName.trim()) {
      newErrors.channelName = 'Channel name is required';
    }
    if (!formData.videoFile) {
      newErrors.videoFile = 'Video file is required';
    } else {
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (formData.videoFile.size > maxSize) {
        newErrors.videoFile = 'Video file must be less than 500MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload video file
      const videoFormData = new FormData();
      videoFormData.append('video', formData.videoFile);
      
      const videoUploadResponse = await api.uploadVideo(videoFormData, (progress) => {
        setUploadProgress(Math.min(progress, 90)); // Reserve 10% for final steps
      });

      let thumbnailUrl = '';
      
      // Upload thumbnail if provided
      if (formData.thumbnailFile) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('thumbnail', formData.thumbnailFile);
        
        const thumbnailUploadResponse = await api.uploadThumbnail(thumbnailFormData);
        thumbnailUrl = thumbnailUploadResponse.file.url;
      }

      // Create video record
      const videoData = {
        title: formData.title,
        description: formData.description,
        channelId: formData.channelId,
        channelName: formData.channelName,
        videoUrl: videoUploadResponse.file.url,
        thumbnail: thumbnailUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        duration: 0 // Will be calculated on backend or client
      };

      setUploadProgress(95);
      const newVideo = await api.createVideo(videoData);
      setUploadProgress(100);

      showSuccess('Video uploaded successfully!');
      
      setTimeout(() => {
        onClose();
        navigate(`/watch?v=${newVideo.id}`);
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      showError(error.message || 'Failed to upload video');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="video-upload-overlay" onClick={onClose}>
      <div className="video-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-header">
          <h2>Upload Video</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter video title"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter video description"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="channelId">Channel ID *</label>
              <input
                type="text"
                id="channelId"
                name="channelId"
                value={formData.channelId}
                onChange={handleInputChange}
                placeholder="channel-id"
                className={errors.channelId ? 'error' : ''}
              />
              {errors.channelId && <span className="error-message">{errors.channelId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="channelName">Channel Name *</label>
              <input
                type="text"
                id="channelName"
                name="channelName"
                value={formData.channelName}
                onChange={handleInputChange}
                placeholder="Channel Name"
                className={errors.channelName ? 'error' : ''}
              />
              {errors.channelName && <span className="error-message">{errors.channelName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="videoFile">Video File *</label>
            <div className="file-upload-area">
              <input
                type="file"
                id="videoFile"
                name="videoFile"
                accept="video/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="videoFile" className="file-label">
                <Upload size={24} />
                <span>{formData.videoFile ? formData.videoFile.name : 'Choose video file'}</span>
              </label>
            </div>
            {errors.videoFile && <span className="error-message">{errors.videoFile}</span>}
            {formData.videoFile && (
              <div className="file-info">
                <span>{(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="thumbnailFile">Thumbnail (optional)</label>
            <div className="file-upload-area">
              <input
                type="file"
                id="thumbnailFile"
                name="thumbnailFile"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="thumbnailFile" className="file-label">
                <Upload size={24} />
                <span>{formData.thumbnailFile ? formData.thumbnailFile.name : 'Choose thumbnail image'}</span>
              </label>
            </div>
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader size={20} className="spinner" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;

