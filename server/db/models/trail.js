var mongoose = require('mongoose');

var trailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  path: [{
    lat: Number,
    long: Number
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

var Trail = mongoose.model('Trail', trailSchema);

module.exports = Trail;
