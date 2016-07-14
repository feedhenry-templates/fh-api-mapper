var assert = require('assert'),
  proxyquire = require('proxyquire'),
  requester = proxyquire('../../lib/requester.js', {
    'request' : function(){}
  }),
  requestFixture = require('../fixtures/fixture-example-request.js');

exports.it_should_skip_raw_for_non_debug = function(done){
  requester(requestFixture, function(err, requestResult){
    assert.ok(!requestResult.request.raw);
    assert.ok(!requestResult.response.raw);
    return done();
  });
};

exports.it_should_send_get_requests = function(done){
  requester(requestFixture, true, function(err, requestResult){
    assert.ok(!err, 'Error on sending request to requester');
    assert.ok(requestResult, 'Expected a requestResult');
    assert.ok(requestResult.response, 'Expected requestResult to have a response');
    assert.ok(requestResult.request, 'Expected requestResult to have request data');

    assert.ok(requestResult.request.raw);
    assert.ok(requestResult.response.raw);
    assert.ok(requestResult.request.raw.indexOf('GET')>-1, 'Raw should have HTTP Method');
    assert.ok(requestResult.request.raw.indexOf('foo')>-1, 'Raw should have header key');
    assert.ok(requestResult.request.raw.indexOf('foo')>-1, 'Raw should have header value');
    assert.ok(requestResult.request.raw.indexOf('UPCASE')>-1, 'Should not convert header values to lowercase');
    return done();
  });
};

exports.it_should_send_post_requests = function(done){
  requestFixture.method = 'post';
  requestFixture.body = { message :'Hello world' };
  requester(requestFixture, true, function(err, requestResult){
    assert.ok(requestResult.request.raw.indexOf('POST')>-1, 'Raw should have HTTP Method');
    assert.ok(requestResult.request.raw.indexOf('message')>-1, 'Raw should have request key');
    assert.ok(requestResult.request.raw.indexOf('Hello world')>-1, 'Raw should have request value');
    return done();
  });
};

exports.it_should_throw_error_on_invalid_url = function(done){
  requester({url : 'invalid', method : 'get'}, function(err){
    assert.ok(err, 'Expected error on invalid url');
    return done();
  });
};

exports.it_should_throw_error_on_invalid_method = function(done){
  requester({url : 'http://www.google.ie', method : 'invalid'}, function(err){
    assert.ok(err, 'Expected error on invalid method');
    return done();
  });
};


exports.it_should_throw_error_on_invalid_params = function(done){
  requester({}, function(err){
    assert.ok(err, 'Expected error on invalid params');
    return done();
  });
};
