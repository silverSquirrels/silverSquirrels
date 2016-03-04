require('dotenv').config();
var unirest = require('unirest');

module.exports = {
  getTrails: function(req, res){
    var radius = req.body.radius;
    var lat = req.body.lat;
    var long = req.body.long;
    var limit = 30;

    // Unirest is used to get API data, following example on trailAPI website
    unirest.get("https://trailapi-trailapi.p.mashape.com/?lat="+lat+"&"+limit+"=20&lon="+long+"&q[activities_activity_type_name_eq]=hiking&radius="+radius)
      .header("X-Mashape-Key", process.env.TRAIL_API_KEY)
      .header("Accept", "text/plain")
      .end(function(result){
        if(result.body.places){
          var coordinates = result.body.places.map(function(el){
            // Organize data into an object with name and coordinates properties:
            return {
              name: el.name,
              coordinates: [el.lat, el.lon]
            };
          });
          
          console.log('TrailsAPI coordinates:', coordinates);
          res.send(coordinates);
        } else {
          res.sendStatus(404);
        }
      });
  }
};
