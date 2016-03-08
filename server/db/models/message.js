var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  text: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
