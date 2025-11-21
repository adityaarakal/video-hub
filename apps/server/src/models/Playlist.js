const mongoose = require('mongoose');

const playlistVideoSchema = new mongoose.Schema({
  videoId: String,
  title: String,
  thumbnail: String,
  duration: Number,
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  videos: {
    type: [playlistVideoSchema],
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

playlistSchema.index({ userId: 1 });

module.exports = mongoose.model('Playlist', playlistSchema);

