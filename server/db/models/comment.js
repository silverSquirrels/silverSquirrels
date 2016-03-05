
var Q = require('q');
var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
  user: Number,
  trail: String,
  text: String,
  rating: Number,
  difficulty: Number,
  time: Number
})

commentSchema.methods.getStats = function(trail, cb){
var defer = Q.defer();
  // console.log("!!!!!!!!!!");

  this.model('Comment').find({trail: this.trail}, 'rating difficulty time', function(err, results){
    var output = {};
    var ratingTotal = 0;
    var difficultyTotal = 0;
    var timeTotal = 0

    results.forEach(function(comment, index){
        ratingTotal += comment.rating;
        difficultyTotal += comment.difficulty;
        timeTotal += comment.timeTotal;
    });
    trail.rating = ratingTotal / results.length;
    trail.difficulty = difficultyTotal / results.length;
    trail.time = timeTotal / results.length;
    // output = trail;
    cb(trail);
  });
}


module.exports = mongoose.model('Comment', commentSchema);
