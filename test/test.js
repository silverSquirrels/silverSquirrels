var expect = require('chai').expect;
var request = require ('request');
var assert = require('assert');


describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', functiongit () {
      assert.equal(-1, [1, 2, 3].indexOf(5));
      assert.equal(-1, [1, 2, 3].indexOf(0));
    });
  });
});

// describe('User', function(){    //async code, invokes cb when test is complete
//   describe('#save()', function() {
//     it('should save without error', function(done) {  //cb named 'done' to it(), Mocha knows wait for completion
//       var user = new User('Mandy');
//       user.save(done);                 //done() callback accept an error, can use directly
//       // user.save(function(err) {     
//       //   if (err) throw err;      
//       //   done();
//       // });
//     });
//   });