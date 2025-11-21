const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 5000
  },
  channelId: {
    type: String,
    required: true,
    index: true
  },
  channelName: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

videoSchema.index({ channelId: 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Video', videoSchema);

