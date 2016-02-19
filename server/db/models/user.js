var bcrypt = require('bcrypt-nodejs');
var bluebird = require('bluebird');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema ({
  username: {
    type: String,
    required: true,
    unique: true
  }, 
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.Now
  }
});

var User = mongoose.model('User', userSchema);

userSchema.comparePassword = function(attemptedPW, hashedPW, callback) {
  bcrypt.compare(attemptedPW, hashedPW, function(err, isMatch) {
    if(err) {
      return callback(err);
    }
    callback(null, isMatch);
  });
};

userSchema.pre('save', function(next) {
  var cipher = bluebird.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
});

module.exports = User;