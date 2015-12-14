require('./db.js')();

var express = require('express'),
bodyParser = require('body-parser'),
lessMiddleware = require('less-middleware'),
router = new express.Router(),
Request = require('./models/request.js'),
requester = require('./requester'),
previousRouterStackLength;

router.use(lessMiddleware(__dirname + '/public/css'));
router.use(bodyParser.json());
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
      if (typeof requestResult.response.body !== 'object'){
        return res.status(status).end(requestResult.response.body);
      }
      return res.status(status).json(requestResult.response.body);
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

populateAllRoutes();

module.exports = router;
