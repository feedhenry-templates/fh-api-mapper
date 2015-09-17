var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
require('./lib/db.js')();
//var cors = require('cors');

// list the endpoints which you want to make securable here
var securableEndpoints;
// fhlint-begin: securable-endpoints
securableEndpoints = [];
// fhlint-end

var app = express();

// TODO: Cors is disabled as of now, since it prevents /try route to proxy simply (see #3)
//app.use(cors());
app.engine('html', require('ejs').renderFile);


// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

// allow serving of static files from the public directory
app.use(express['static'](__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

// fhlint-begin: custom-routes
app.get('/', require('./lib/routes/frontend.js'));
app.get('/requests', require('./lib/routes/frontend.js'));
app.get('/requests/*', require('./lib/routes/frontend.js'));
app.use('/try', require('./lib/routes/try.js')());
app.use('/api/requests', require('./lib/routes/requests.js')());
// fhlint-end

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
module.exports = app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port); 
});
