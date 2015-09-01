var express = require('express');
var bodyParser = require('body-parser');
var Mapping = require('../models/mapping.js');

module.exports = function() {
  var mappings = new express.Router();
  mappings.use(bodyParser.json());
  
  mappings.get('/', function(req, res){
    Mapping.find({}, function(err, mappings){
      if (err){
        return res.status(500).json(err);
      }
      return res.json(mappings);
    });
  });

  mappings.post('/', function(req, res) {
    var createdMapping = new Mapping(req.body);
    createdMapping.save(function(err, newMapping){
      if (err){
        // TODO: Better validation error handling?
        return res.status(500).json(err);
      }
      return res.json(newMapping);
    });
  });
  
  mappings.use(function errorHandler(err, req, resp) {
    resp.status(500).send(err.message);
  });

  return mappings;
};
