import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, Video, Image, X, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import './VideoUpload.css';

const VideoUpload = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'video') {
        setVideoFile(file);
      } else {
        setThumbnailFile(file);
      }
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === 'video') {
        setVideoFile(file);
      } else {
        setThumbnailFile(file);
      }
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('video', videoFile);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      const uploadResponse = await api.uploadVideo(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      if (uploadResponse.videoUrl) {
        const videoData = {
          title: title.trim(),
          description: description.trim(),
          channelId: 'admin',
          channelName: 'Admin',
          videoUrl: uploadResponse.videoUrl,
          thumbnail: uploadResponse.thumbnailUrl || '',
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
          duration: 0,
        };
        
        await api.createVideo(videoData);
        setSuccess('Video uploaded successfully!');
        setTimeout(() => {
          navigate('/videos');
        }, 2000);
      } else {
        throw new Error('Video URL not returned from upload.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload video.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setThumbnailFile(null);
    setTitle('');
    setDescription('');
    setTags('');
    setUploadProgress(0);
    setError('');
    setSuccess('');
  };

  return (
    <div className="cms-page">
      <header className="cms-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            <ArrowLeft size={20} />
            Back
          </button>
          <h1>Upload Video</h1>
        </div>
      </header>

      <div className="cms-content">
        <div className="upload-container">
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <div className="upload-section">
            <label className="upload-label">Video File *</label>
            <div
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'video')}
              onClick={() => videoInputRef.current?.click()}
            >
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={(e) => handleFileChange(e, 'video')}
                style={{ display: 'none' }}
              />
              {videoFile ? (
                <div className="file-preview">
                  <Video size={24} />
                  <span>{videoFile.name}</span>
                  <button className="remove-file-btn" onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <UploadCloud size={48} />
                  <p>Drag & drop your video here, or click to select</p>
                  <span>(Max 100MB, MP4, MOV, AVI, etc.)</span>
                </div>
              )}
            </div>
          </div>

          <div className="upload-section">
            <label className="upload-label">Thumbnail Image (Optional)</label>
            <div
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'thumbnail')}
              onClick={() => thumbnailInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={thumbnailInputRef}
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                style={{ display: 'none' }}
              />
              {thumbnailFile ? (
                <div className="file-preview">
                  <Image size={24} />
                  <span>{thumbnailFile.name}</span>
                  <button className="remove-file-btn" onClick={(e) => { e.stopPropagation(); setThumbnailFile(null); }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <Image size={48} />
                  <p>Drag & drop your thumbnail here, or click to select</p>
                  <span>(JPG, PNG, GIF)</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Video Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video"
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., tutorial, demo, showcase"
            />
          </div>

          <div className="upload-actions">
            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={uploading || !videoFile || !title.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 size={20} className="spinner" /> Uploading {uploadProgress}%
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} /> Publish Video
                </>
              )}
            </button>
            <button
              className="cancel-button"
              onClick={resetForm}
              disabled={uploading}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;

