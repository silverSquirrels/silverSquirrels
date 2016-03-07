var User = require('../db/models/user.js');
var Trail = require('../db/models/trail.js');
var Q = require('q');
var jwt = require('jwt-simple');

module.exports = {
  signin: function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var findUser = Q.nbind(User.findOne, User);
    
    findUser({username: username})
      .then(function(user) {
        if(!user) {
          next(new Error('User does not exist!'));
        } else {
          return user.comparePassword(password)
            .then(function(foundUser) {
              if(foundUser) {
                var token = jwt.encode(user, 'superskrull');
                res.json({token: token});
              } else {
                return next(new Error('No User!'));
              }
            });
        }
      })
      .fail(function(error) {
        next(error);
      });
  },
  
  signup: function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var create;
    var newUser;
    
    var findOne = Q.nbind(User.findOne, User);
    
    // check to see if user already exists
    findOne({username: username})
      .then(function(user) {
        if(user) {
          next(new Error('User already exists!'));
        } else {
          // create a new user
          create = Q.nbind(User.create, User);
          newUser = {
            username: username,
            password: password
          };
        }
        return create(newUser);
      })
      .then(function(user) {
        // create token to send back for authorization
        var token = jwt.encode(user, 'superskrull');
        res.json({token: token});
      })
      .fail(function(error) {
        next(error);
      });
  },

  checkAuth: function(req, res, next) {
    // check user authentication
    // grab token from header
    var token = req.headers['x-access-token'];
    if(!token) {
      next(new Error('No token!'));
    } else {
      // decode token
      var user = jwt.decode(token, 'superskrull');
    // check if user is in database
    var findUser = Q.nbind(User.findOne, User);
    findUser({username: user.username})
      .then(function(foundUser) {
        if(foundUser) {
          res.send(200);
        } else {
          res.send(401);
        }
      })
      .fail(function(error) {
        next(error);
      });
    }
  },

  getUser: function(req, res, next){
    // check user authentication
    // grab token from header
    var token = req.headers['x-access-token'];
    if(!token) {
      next(new Error('No token!'));
    } else {
      // decode token
      var user = jwt.decode(token, 'superskrull');
    // check if user is in database
    
    var findUser = Q.nbind(User.findOne, User);
    findUser({username: user.username})
      .then(function(foundUser) {
        if(foundUser) {
          res.send({
            username: foundUser.username,
            location: foundUser.location,
            hikerStatus: foundUser.hikerStatus,
            trails: foundUser.trails,
            path: foundUser.trail
          });
        } else {
          res.send(401);
        }
      })
      .fail(function(error) {
        next(error);
      });
    }
  },
  
  addTrailToUserTrails: function(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token trying to post to user/trails'))
    }
    var trailData = req.body.trail;
    var user = jwt.decode(token, 'superskrull');
    User.findOne({username: user.username})
      .exec(function(err, foundUser) {
        if (err) {
          next(new Error('Failed to find user while adding trail:', err));
        }
        console.log(trailData)
        Trail.findOrCreate({name: trailData.name}, function(err, trail, created) {
          if (err) {
            next(new Error('There was an error finding or creating a trail:', err));
          }
          foundUser.trails.addToSet({
            _id: trail._id,
            done: trailData.done
          });
          console.log(foundUser);
          foundUser.save()
            .then(function(result) {
              res.send(result);
            })
            .catch(function(err) {
              next(new Error('There was an error saving the user with a new trail', err));
            });
        })
      })
      .catch(function(err) {
        if (err) {
          console.log('There was an error adding', trailName, 'to user', user.username, ':', err);
          res.sendStatus(500);
        }
      })
  },
  
  updateUserTrail: function(req, res, next) {
   var token = req.headers['x-access-token'];
   if (!token) {
     next(new Error('No token trying to put to user/trails'));
   }
   var trailData = req.body.trail;
   var user = jwt.decode(token, 'superskrull');
   User.findOne({username: user.username})
     .exec(function(err, foundUser) {
       if (err) {
         console.log('Failed to find user while updating trail:', err);
         res.sendStatus(404);
       }
       Trail.findOrCreate({name: trailData.name}, function(err, trail, created) {
         if (err) {
           next(new Error('There was an error finding or creating trail to update:', err));
           res.sendStatus(500);
         
         }
         if (created) {
           foundUser.trails.push({
             _id: trail._id,
             done: trailData.done
           });
           var trailIdx = foundUsers.trails.length - 1;
         }
         if (!trailIdx) {
           for (var i = 0; i < foundUser.trails.length; i++) {
             if (foundUser.trails[i]._id + '' === trail._id + '') {
               trailIdx = i;
               break;
             }
           }
         }
         foundUser.trails[trailIdx].done = trailData.done;
         
         foundUser.save();
         
         res.sendStatus(202);
       })
     })
     .catch(function(err) {
       console.log('There was an error changing trail:', err);
       res.sendStatus(500);
     });
  },

  addFriend: function(req, res, next) {
    var token = req.headers['x-access-token'];
    if(!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, 'superskrull');
      User.findOne({ username: user.username }).exec(function(err, foundUser) {
        if(err){
          next(new Error('Failed to find user!'));
        }
        User.findOne({ username: req.body.newFriend }).exec(function(err, newFriend) {
          if(err) {
            next(new Error('addFriend failed'));
          }
          if(newFriend) {
            foundUser.friends.addToSet(newFriend);
            foundUser.save();
            res.sendStatus(204);
          } else {
            res.sendStatus(404);
          }
        });
      });
    }
  },
  
  getFriends: function(req, res, next) {
    var token = req.headers['x-access-token'];
    if(!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, 'superskrull');
      User.findOne({ username: user.username })
      .populate('friends', 'username haveDone wantToDo')
      .exec(function(err, foundUser) {
        if(err){
          next(new Error('Failed to find user!'));
        }
        res.json({
          friends: foundUser.friends
        });
      });
    }
  },
  //Doesn't require auth because sockets are only initialized after auth
  updateLocation: function (data) {
    User.findOne({username: data.user})
      .then(function(results) {
        results.location.lat = data.location.lat;
        results.location.long = data.location.long;
        
        if (!results.path.length) {
          results.path.push(results.location);
        }
        
        // Trail.findOne({name: data.name})
        var last = results.path[results.path.length - 1];
        
        var distance = Math.sqrt(Math.pow((last.lat - data.location.lat), 2) 
          + Math.pow((last.long - data.location.long), 2));
        
        if (distance > .0001) {
          results.path.addToSet(results.location);
        }
        results.save()
          .catch(function errHandler (err) {
            console.log('There was an error saving the new location:', err);
          });
      })
      .catch(function errHandler (err) {
        console.log('There was an error querying the database:', err);
      });
  }
};