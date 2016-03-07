var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  sender: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  recipient: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  text: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
