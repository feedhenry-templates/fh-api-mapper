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

exports.it_should_send_post_requests_with_valid_json = function(done){
  requestFixture.method = 'post';
  requestFixture.headers = [
    { key : 'content-type', value : 'application/json' },
    { key : 'accept', value : 'application/json' }
  ];
  requestFixture.body = { "barcode" : "077924004971" };
  requestFixture.url = 'http://jsonplaceholder.typicode.com/posts';
  requester(requestFixture, true, function(err, requestResult){
    assert.ok(requestResult.request.raw.indexOf('POST')>-1, 'Raw should have HTTP Method');
    assert.ok(requestResult.request.raw.indexOf('barcode')>-1, 'Raw should have json key name in the body');
    assert.ok(requestResult.request.raw.indexOf('077924004971')>-1, 'Raw should have json value in the body');
    assert.ok(requestResult.request.headers.accept === "application/json");
    assert.ok(requestResult.request.headers["content-type"] === "application/json");
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
