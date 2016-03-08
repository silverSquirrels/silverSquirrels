
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
  // console.log("!!!!!!!!!!");

  this.model('Comment').find({trail: this.trail}, 'rating difficulty time', function(err, results){
    var output = {};
    var ratingTotal = 0;
    var difficultyTotal = 0;
    var timeTotal = 0
    var ratingsCount = 0;
    var difficultyCount = 0;
    var timeCount = 0;
    results.forEach(function(comment, index){
      if (comment.rating){
        ratingTotal += comment.rating;
        ratingsCount++;
      }
      if (comment.difficulty){
        difficultyTotal += comment.difficulty;
        difficultyCount++;
      }
      if (comment.time){
        timeTotal += comment.time;
        timeCount++;
      }
    });
    trail.rating = ratingTotal / ratingsCount;
    trail.difficulty = difficultyTotal / difficultyCount;
    trail.time = timeTotal / timeCount;
    // output = trail;
    cb(trail);
  });
}


module.exports = mongoose.model('Comment', commentSchema);
