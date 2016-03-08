var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var trailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    lat: Number,
    long: Number
  },
  path: [{
    lat: Number,
    long: Number
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

trailSchema.plugin(findOrCreate);

var Trail = mongoose.model('Trail', trailSchema);

module.exports = Trail;
