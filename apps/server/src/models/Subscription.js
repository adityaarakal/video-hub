const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  channelId: {
    type: String,
    required: true,
    index: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

subscriptionSchema.index({ userId: 1, channelId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);

