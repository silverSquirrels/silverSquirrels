var Comment = require('../db/models/comment.js');
var Q = require('q');
var unirest = require('unirest');


module.exports = {
  submit: function(req, res, next){
    var create = Q.nbind(Comment.create, Comment);
    var options = {
      username : req.body.info,
      text : req.body.text,
      trail : req.body.trail,
      distance : req.body.distance,
      time : req.body.time,
      rating : req.body.rating
    }

    create(options).then(function(result){
    }).fail(function(error){
      next(error);
    });

  },

  getTrailComments : function(req, res, next){
    var findComments = Q.nbind(Comment.find, Comment);
    findComments({trail: req.body.trail}).then(function(results){
      if (results){
        res.json(results);
      }else{
        console.log("no results found");
      }
    })
  },

  getUserComments : function(req, res, next){
    var findComments = Q.nbind(Comment.find, Comment);
    findComments({username: req.body.username}).then(function(results){
      if (results){
        res.json(results);
      }else{
        console.log("no results found");
      }
    })
  },
  getAllStats : function(trails){
    var trailsStats = {};
    var finished = trails.length;
    console.log("in getAllStats");
    trails.forEach(function(trail, i){
      console.log("in forEach");
      new Comment({trail: trail.name}).getStats().then(function(results){
        console.log("got stats");
        trailsStats[trail.name] = results;
      }, function(error){
        console.log("error", error);
      }, function(){
        console.log("progress");
      });

    });
    return trailsStats;
  },

  getTrails : function(req, res, next){
    var radius = req.body.radius;
    var lat = req.body.lat;
    var long = req.body.long;
    var limit = 30;
    var comment = new Comment();
    var getAllStats = Q.fbind(module.exports.getAllStats);
  // Unirest is used to get API data, following example on trailAPI website
    unirest.get("https://trailapi-trailapi.p.mashape.com/?lat="+lat+"&"+limit+"=20&lon="+long+"&q[activities_activity_type_name_eq]=hiking&radius="+radius)
      .header("X-Mashape-Key", 'AbCpru5TaLmshYZXSEgdDyebyrAkp1lmuZrjsnETV9pzmRhHHi')
      .header("Accept", "text/plain")
    .end(function(result){
      // console.log(result);
      if(result.body.places){
        var trails = result.body.places.map(function(el){
          console.log(el.name);
            return {
              name: el.name,
              coordinates: [el.lat, el.lon],
            };
          // Organize data into an object with name and coordinates properties:
        })
        // console.log(Comment);
        getAllStats(trails).then(function(trails){
          console.log('trails', trails);
          res.send(trails);
        });

      } else {
        res.sendStatus(404);
      }
    });
  },


}
