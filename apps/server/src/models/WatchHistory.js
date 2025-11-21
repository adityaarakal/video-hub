const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  videoId: {
    type: String,
    required: true
  },
  videoTitle: String,
  videoThumbnail: String,
  channelName: String,
  watchedAt: {
    type: Date,
    default: Date.now
  }
});

watchHistorySchema.index({ userId: 1, watchedAt: -1 });

module.exports = mongoose.model('WatchHistory', watchHistorySchema);

