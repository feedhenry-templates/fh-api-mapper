var express = require('express');
var bodyParser = require('body-parser');
var Request = require('../models/request.js');
var Mapping = require('../models/mapping.js');

module.exports = function() {
  var requests = new express.Router();
  requests.use(bodyParser.json());
  
  requests.get('/', function(req, res){
    Request.find({}).populate('headers').exec(function(err, requestsList){
      if (err){
        return res.status(500).json(err);
      }
      return res.json(requestsList);
    });
  });
  
  requests.get('/:id/:export?', function(req, res){
    Request.findOne({ _id : req.params.id }).populate('headers').populate('mapping').exec(function(err, requestResult){
      if (err){
        return res.status(500).json(err);
      }
      if (!requestResult){
        return res.status(401).json({ message : 'Could not find requested id ' + req.params.id });
      }
      // DRYs up API route - set this header only if we want to trigger browser download of the requested resource
      if (req.params['export'] === "export"){
        res.setHeader('Content-disposition', 'attachment; filename=' + req.params.id + '.json');
      }
      return res.json(requestResult);
    });
  });
  
  requests.put('/:id', function(req, res){
    Request.update({ _id : req.params.id }, req.body, function(err, updateResult){
      if (err){
        return res.status(500).json(err);
      }
      return res.json(updateResult);
    });
  });
  
  requests['delete']('/:id', function(req, res){
    Request.findOne({_id : req.params.id}).remove(function(err, removeRes){
      if (err){
        return res.status(500).json(err);
      }
      return res.json(removeRes);
    });
  });

  requests.post('/', function(req, res) {
    var createdRequest = new Request(req.body);
    createdRequest.save(function(err, newRequest){
      if (err){
        // TODO: Better validation error handling?
        return res.status(500).json(err);
      }
      return res.json(newRequest);
    });
  });
  
  requests.post('/:id/mapping', function(req, res){
    var requestId = req.params.id;
    Request.findOne({ _id : requestId }).populate('headers').exec(function(err, request){
      if (err || !request){
        return res.status(500).json(err || 'Could not find request with ID ' + requestId);
      }
      request.createMapping(request, function(err, newMapping){
        if (err){
          var status = (err) ? 500 : 404;
          return res.status(status).json(err);
        }
        return res.json(newMapping);
      });
    });
  });
  
  requests.put('/:id/mapping/:mappingId', function(req, res){
    Mapping.update({ _id : req.params.mappingId }, req.body, function(err, updateResult){
      if (err){
        return res.status(500).json(err);
      }
      return res.json(updateResult);
    });
  });
  
  requests['delete']('/:id/mapping', function(req, res){
    var requestId = req.params.id;
    Request.findOne({ _id : requestId }).exec(function(err, request){
      if (err || !request){
        var status = (err) ? 500 : 404;
        return res.status(status).json(err || 'Could not find request with ID ' + requestId);
      }
      request.removeMapping(function(err, removedMapping){
        if (err){
          return res.status(500).json(err);
        }
        return res.status(200).json(removedMapping);
      });
    });
  });
  
  requests.use(function errorHandler(req, resp) {
    resp.status(500).send('No route found for ' + req.path);
  });

  return requests;
};
