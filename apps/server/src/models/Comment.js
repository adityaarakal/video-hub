const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const commentSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  replies: {
    type: [replySchema],
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

commentSchema.index({ videoId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);

