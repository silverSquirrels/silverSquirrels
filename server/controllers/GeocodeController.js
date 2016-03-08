require('dotenv').config();
var unirest = require('unirest');

module.exports = {
  getCoords: function(req, res) {
    var address = req.body.search.split(', ');
    
    unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + address.join('+') + 'key=' + process.env.GEOCODING_API_KEY)
      .header('Accept', 'json/application')
      .end(function(response) {
        body = response.body;
        if (body.results.length) {
          body.results[0].geometry.location.long = body.results[0].geometry.location.lng;
          delete body.results[0].geometry.location.lng;
          return res.send(body.results[0].geometry.location);
        }
        return res.sendStatus(404);      
      });
  }
};
