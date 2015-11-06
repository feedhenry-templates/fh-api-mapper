var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();

var cors = require('cors');

var app = express();

app.use(cors());
app.engine('html', require('ejs').renderFile);


// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys([]));
app.use('/mbaas', mbaasExpress.mbaas);
app.use(express['static'](__dirname + '/public'));


// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());


// fhlint-begin: custom-routes
app.use('/', require('./lib/api'));
// fhlint-end

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
module.exports = app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port); 
});
