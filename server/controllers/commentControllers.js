var Comment = require('../db/models/comment.js');
var Q = require('q');
var unirest = require('unirest');
var Promise = require("bluebird");


module.exports = {
  submit: function(req, res, next){
    console.log("create");
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
      console.log(result);
      res.json(result);
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

  getAllStats : function(trails, cb){
    var asyncMap = function(tasks, callback){
    var resultsArray = [];
    var resultsCount = 0;

     for (var i = 0; i < tasks.length; i++){
       (function(i){
         tasks[i](function(val){
          resultsArray[i] = val;
          resultsCount++;
          if (resultsCount === tasks.length){
            callback(resultsArray);
          }
         });
       })(i);
     }
    };

    var tasks = trails.map(function(trail){
     return function(next){
       Comment({trail: trail.name}).getStats(trail, next);
    }});

    asyncMap(tasks, cb);
  },

  getTrails : function(req, res, next){
    var radius = req.body.radius;
    var lat = req.body.lat;
    var long = req.body.long;
    var limit = 30;
    var comment = new Comment();
    // var getAllStats = Q.denodeify(module.exports.getAllStats);
  // Unirest is used to get API data, following example on trailAPI website
    unirest.get("https://trailapi-trailapi.p.mashape.com/?lat="+lat+"&"+limit+"=20&lon="+long+"&q[activities_activity_type_name_eq]=hiking&radius="+radius)
      .header("X-Mashape-Key", process.env.TRAIL_API_KEY)
      .header("Accept", "text/plain")
    .end(function(result){
      // console.log(result);
      if(result.body.places){
        var trails = result.body.places.map(function(el){
            return {
              name: el.name,
              coordinates: [el.lat, el.lon],
            };
          // Organize data into an object with name and coordinates properties:
        })
        // console.log(Comment);
        module.exports.getAllStats(trails, function(results){
          res.send(results);
        });

      } else {
        res.sendStatus(404);
      }
    });
  },


}
