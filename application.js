var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var lessMiddleware = require('less-middleware');
var cors = require('cors');
require('./lib/db.js')();


// list the endpoints which you want to make securable here
var securableEndpoints;
// fhlint-begin: securable-endpoints
securableEndpoints = [];
// fhlint-end

var app = express();

app.use(cors());
app.engine('html', require('ejs').renderFile);


// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

app.use(lessMiddleware(__dirname + '/public'));
app.use(express['static'](__dirname + '/public'));


// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

// fhlint-begin: custom-routes
app.get('/', require('./lib/routes/frontend.js'));
app.get('/requests', require('./lib/routes/frontend.js'));
app.get('/requests/*', require('./lib/routes/frontend.js'));
app.use('/try', require('./lib/routes/try.js')());
app.use('/api/requests', require('./lib/routes/requests.js')());
app.get('/api/transformations', require('./lib/routes/transformations.js'));
// fhlint-end

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
module.exports = app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port); 
});
