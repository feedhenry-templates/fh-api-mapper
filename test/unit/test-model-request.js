var assert = require('assert'),
mongoose = require('mongoose'),
mockgoose = require('mockgoose'),
Request, Mapping;

// in-memory mongoose for model testing
mockgoose(mongoose, true);

Request = require('../../lib/models/request');
Mapping = require('../../lib/models/mapping');

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

exports.it_should_create_requests_with_a_mapping = function(done){
  var mapping = new Mapping({
    type : "object",
    fields : [
      {
        type : "number",
        from : "foo",
        to : "bar"
      }
    ]
  });
  return mapping.save(function(err, savedMapping){
    assert.ok(!err, 'Unable to create simple mapping: ' + err);
    var mappingId = savedMapping._id;
    var req = new Request({
      method : 'get',
      url : 'http://www.google.ie',
      mapping : mappingId,
      mountPath : '/valid'
    });
    req.save(function(err){
      assert.ok(!err);
      return done();
    });
  });
};
