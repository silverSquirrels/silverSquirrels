var bcrypt = require('bcrypt-nodejs');
var Q = require('q');
var mongoose = require('mongoose');
var SALT_WORK_FACTOR = 10;

var userSchema = new mongoose.Schema ({
  username: {
    type: String,
    required: true,
    unique: true
  }, 
  password: {
    type: String,
    required: true
  },
  created_at: {type: Date},
  updated_at: {type: Date},

  salt: String,
  haveDone: [String],
  wantToDo: [String]
});

userSchema.methods.comparePassword = function(attemptedPW) {
  var defer = Q.defer();
  var hashedPW = this.password;
  bcrypt.compare(attemptedPW, hashedPW, function(err, isMatch) {
    if(err) {
      defer.reject(err);
    } else {
      defer.resolve(isMatch);
    }
  });
  return defer.promise;
};

userSchema.pre('save', function(next) {
  var user = this;

  now = new Date();
  user.updated_at = now;
  if ( !user.created_at ) {
    user.created_at = now;
  }
  
  // only hash the password if it is new or modified
  if(!user.isModified('password')) {
    return next();
  }
  // create salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) {
      return next(err);
    }
    // hash password with salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if(err) {
        return next(err);
      }
      // save hashed password to user
      user.password = hash;
      user.salt = salt;
      next();
    });
  });
});

var User = mongoose.model('User', userSchema);

module.exports = User;