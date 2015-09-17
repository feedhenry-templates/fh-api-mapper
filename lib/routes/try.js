var express = require('express');
var request = require('request');
var streamBuffers = require("stream-buffers");

function getRequestedUrl( req, resp ) {
  var url = req.headers['x-request-url'];
  if (!url) {
    return resp.status(500).send('URL must be provided in x-request-url header');
  }
  delete req.headers['x-request-url'];
  return url;
}

function enrichResponseWithRequestHeaders( req, resp ) {
  var headers = {},
  headersBase64;
  try{
    headers = JSON.stringify(req.headers);
  }catch(err){
    console.error("Error stringifying headers - setting to empty object.");
  }
  headersBase64 = new Buffer(headers).toString('base64');
  resp.setHeader('x-try-headers', headersBase64);
}

module.exports = function() {
  var proxy = new express.Router();
  
  proxy.all('/', function( req, resp ) {
    var requestedUrl = getRequestedUrl( req, resp );
    enrichResponseWithRequestHeaders( req, resp );
    var requestBuffer = new streamBuffers.WritableStreamBuffer({
      initialSize: (100 * 1024),      // start as 100 kilobytes.
      incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
    });
    var responseBuffer = new streamBuffers.WritableStreamBuffer({
      initialSize: (100 * 1024),      // start as 100 kilobytes.
      incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
    });
    req.pipe( requestBuffer );
    var responseStream = req.pipe( request(requestedUrl) );
    responseStream.pipe( responseBuffer );
    responseStream.on('response', function(response) {
      // piggy back raw request payload in response headers
      var requestContents = requestBuffer.getContents();
      if (requestContents) {
        resp.setHeader('x-try-payload', requestContents.toString('base64'));
      }
      // set up response headers
      Object.keys(response.headers).forEach(function( key ) {
        var value = response.headers[key];
        resp.setHeader(key, value);
      });
      // set up response status
      resp.status(response.statusCode);

      responseStream.on('end', function() {
        var responseContents = responseBuffer.getContents();
        var finalResponseStream = new streamBuffers.ReadableStreamBuffer({
          frequency: 10,       // in milliseconds.
          chunkSize: 2048     // in bytes.
        });
        finalResponseStream.pipe( resp );
        finalResponseStream.put(responseContents);
        finalResponseStream.destroySoon();
      });
    });
    //responseStream.pipe( resp );
  });
  
  return proxy;
};
