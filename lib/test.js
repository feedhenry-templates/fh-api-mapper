var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

module.exports = function() {
  var proxy = new express.Router();

  proxy.all('/', bodyParser(), function(req, res) {
    var data = {
      headers: req.headers,
      body: req.body
    };
    res.json( data );
  });

  return proxy;
};
