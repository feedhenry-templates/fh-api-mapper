var express = require('express');
var request = require('request');

module.exports = function() {
  var proxy = new express.Router();
  
  proxy.all('/', function(req, res) {
    var url = req.headers['x-request-url'];
    if (!url) {
      return res.status(500).send('URL must be provided in x-request-url header');
    }
    delete req.headers['x-request-url']
    return req.pipe(request(url)).pipe(res);
  });
  
  return proxy;
};
