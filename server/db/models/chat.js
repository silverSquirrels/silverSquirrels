var mongoose = require('mongoose');

var chatSchema = new mongoose.Schema({
  // users: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  // }],
  users: [String],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: Date
});

chatSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
