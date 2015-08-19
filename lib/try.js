var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request');

module.exports = function() {
  var proxy = new express.Router();
  proxy.use(cors());
  proxy.use(bodyParser());
  
  proxy.all('/', function(req, res) {  
    var url = req.query.url;
    return req.pipe(request(url)).pipe(res);
  });
  
  return proxy;
};
