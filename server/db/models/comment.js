
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

commentSchema.methods.getStats = function(){
  var output = {};
  // console.log("!!!!!!!!!!");
  // console.log(this);
  this.model('Comment').find({trail: this.trail}, 'rating difficulty time').then(function(results){
    var ratingTotal = 0;
    var difficultyTotal = 0;
    var timeTotal = 0

    results.forEach(function(comment, index){
        ratingTotal += comment.rating;
        difficultyTotal += comment.difficulty;
        timeTotal += comment.timeTotal;
    });
    output.rating = ratingTotal / results.length;
    output.difficulty = difficultyTotal / results.length;
    output.time = timeTotal / results.length;
    // output = trail;
    console.log(output);
  });
  return output;
}


module.exports = mongoose.model('Comment', commentSchema);
