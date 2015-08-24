var express = require('express');
var request = require('request');

module.exports = function() {
  var proxy = new express.Router();
  
  proxy.all('/', function( req, resp ) {
    var requestedUrl = getRequestedUrl( req );
    enrichResponseWithRequestHeaders( req, resp );
    return req.pipe( request(requestedUrl) ).pipe( resp );
  });

  function getRequestedUrl( req ) {
    var url = req.headers['x-request-url'];
    if (!url) {
      return resp.status(500).send('URL must be provided in x-request-url header');
    }
    delete req.headers['x-request-url'];
    return url;
  }

  function enrichResponseWithRequestHeaders( req, resp ) {
    var serializedHeaders = serializeHeaders( req );
    var headersBase64 = new Buffer(serializedHeaders).toString('base64');
    resp.setHeader('x-try-headers', headersBase64);
  }

  function serializeHeaders( req ) {
    var array = [];
    Object.keys(req.headers).forEach( function( key ) {
      var value = req.headers[key];
      array.push( key + ': ' + value );
    });
    return array.join('\n');
  }
  
  return proxy;
};