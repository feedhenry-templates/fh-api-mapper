require('./db.js')();

// TODO: Eventually this will be the main entry point, includable as api middleware into other applications as a node module.
module.exports = function(config){
  var express = require('express'),
  bodyParser = require('body-parser'),
  _ = require('underscore'),
  router = new express.Router(),
  Request = require('./models/request.js'),
  Mapping = require('./models/mapping.js'),
  requester = require('./requester'),
  transformations = require('./default_transformations'),
  previousRouterStackLength;
  
  if (config.transformations){
    _.each(config.transformations, function(transformation, name){
      transformations._set(name, transformation);
    });
  }

  router.use(bodyParser.json());
  // Disable require cache for development or the test runner fails on node 0.10 and 0.12
  router.get('/', require('./routes/frontend.js'));
  router.get('/requests', require('./routes/frontend.js'));
  router.get('/requests/*', require('./routes/frontend.js'));
  router.use('/try', require('./routes/try.js')());
  router.use('/api/requests', require('./routes/requests.js')());
  router.get('/api/transformations', require('./routes/transformations.js'));
  // this is what we will restore the router stack to when tearing down any stale mounted request handlers
  previousRouterStackLength = router.stack.length; 

  // Adds a single route into the router from a request definition in the DB
  function populateSingleRoute(request){  
    var method = request.method, 
    mountPath = request.mountPath;
    
    if (!mountPath){
      console.warn('WARNING: Request found with no mount path - probably from a previous version of REST client. Offending request: ');
      console.log(request);
      return;
    }
    
    router[method.toLowerCase()](mountPath, function(req, res){
      // Handle the mounted route using our requester library
      return requester(request, false, function(err, requestResult){
        if (err){
          return res.status(500).json(err);
        }
        var status = requestResult.response.statusCode || 500;
        
        if (!requestResult || !requestResult.response || !requestResult.response.body){
          return res.status(status).end();
        }
        
        var responseBody = requestResult.response.mapped || requestResult.response.body;
        if (typeof responseBody !== 'object'){
          return res.status(status).end(responseBody);
        }
        return res.status(status).json(responseBody);
      });
    });
  }

  // Finds all our requests, clears out the router of any old request definitions, then adds these routes to the DB
  function populateAllRoutes(){
    Request.find({}).populate('headers mapping').exec(function(err, requestsList){
      if (err){
        console.error("Failed to find routes on startup: " + JSON.stringify(err));
      }
      // Restore our router to it's previous state before we had mounted any user routes
      router.stack.splice(previousRouterStackLength, router.stack.length);
      // Now, re-mount every route to ensure we're up to date
      requestsList.forEach(populateSingleRoute);
    });
  }
  Request.schema.on('update', populateAllRoutes);
  Request.schema.on('save', populateAllRoutes);
  Mapping.schema.on('update', populateAllRoutes);
  Mapping.schema.on('save', populateAllRoutes);


  populateAllRoutes();

  return router;
};
