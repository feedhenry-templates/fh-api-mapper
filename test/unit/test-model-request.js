var assert = require('assert'),
mongoose = require('mongoose'),
mockgoose = require('mockgoose'),
Request;

// in-memory mongoose for model testing
mockgoose(mongoose, true);

Request = require('../../lib/models/request');

exports.it_should_require_all_required_fields = function(done){
  var req = new Request({
    method : 'get'
  });
  req.save(function(err){
    assert.ok(err);
    return done();
  });
};

exports.it_should_reject_invalid_methods = function(done){
  var req = new Request({
    method : 'DOESNTEXIST',
    url : 'http://www.google.ie'
  });
  req.save(function(err){
    assert.ok(err);
    return done();
  });
};

exports.it_should_capitalise_methods = function(done){
  var method = 'get',
  req = new Request({
    method : 'get',
    url : 'http://www.google.ie'
  });
  req.save(function(err, createRes){
    assert.ok(!err);
    assert.ok(createRes);
    assert.ok(createRes.method === method.toUpperCase());
    return done();
  });
};
