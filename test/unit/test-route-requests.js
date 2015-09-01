var assert = require('assert');
var request = require('supertest');
var proxyquire = require('proxyquire');
var app = proxyquire('../../application.js', {
  './lib/db.js' : function(){},
  '../models/request.js' : require('../fixtures/fixture-model-request')
});

exports.it_should_list_requests = function(done){
  request(app)
  .get('/requests')
  .expect(200)
  .end(function(err, res){
    assert.ok(!err, 'Error listing requests: ' + err);  
    assert.ok(res.body.length > 0);
    return done();
  });
};

exports.it_should_create_a_request = function(done){
  request(app)
  .post('/requests')
  .send({
    url : 'http://www.google.ie', method : 'get'
  })
  .expect(200)
  .end(function(err, res){
    assert.ok(!err, 'Error creating request: ' + err);  
    assert.ok(res.body);
    return done();
  });
};
