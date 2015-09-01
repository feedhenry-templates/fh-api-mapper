var assert = require('assert'),
mongoose = require('mongoose'),
mockgoose = require('mockgoose'),
Mapping;

// in-memory mongoose for model testing
mockgoose(mongoose, true);

Mapping = require('../../lib/models/mapping');

exports.it_should_require_all_required_fields = function(done){
  var map = new Mapping({
    method : 'get'
  });
  map.save(function(err){
    assert.ok(err);
    return done();
  });
};

exports.it_should_reject_invalid_methods = function(done){
  var map = new Mapping({
    method : 'DOESNTEXIST',
    url : 'http://www.google.ie'
  });
  map.save(function(err){
    assert.ok(err);
    return done();
  });
};

exports.it_should_capitalise_methods = function(done){
  var method = 'get',
  map = new Mapping({
    method : 'get',
    url : 'http://www.google.ie'
  });
  map.save(function(err, createRes){
    assert.ok(!err);
    assert.ok(createRes);
    assert.ok(createRes.method === method.toUpperCase());
    return done();
  });
};
