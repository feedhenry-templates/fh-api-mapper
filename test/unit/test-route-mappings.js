var assert = require('assert');
var request = require('supertest');
var proxyquire = require('proxyquire');
var app = proxyquire('../../application.js', {
  './lib/db.js' : function(){},
  '../models/mapping.js' : require('../fixtures/fixture-model-mapping')
});

exports.it_should_list_mappings = function(done){
  request(app)
  .get('/mappings')
  .expect(200)
  .end(function(err, res){
    assert.ok(!err, 'Error listing mappings: ' + err);  
    assert.ok(res.body.length > 0);
    return done();
  });
};

exports.it_should_create_a_mapping = function(done){
  request(app)
  .post('/mappings')
  .send({
    url : 'http://www.google.ie', method : 'get'
  })
  .expect(200)
  .end(function(err, res){
    assert.ok(!err, 'Error creating mapping: ' + err);  
    assert.ok(res.body);
    return done();
  });
};
