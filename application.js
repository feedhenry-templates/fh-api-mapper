var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var lessMiddleware = require('less-middleware');
var apiMapper = require('./lib/api');
var cors = require('cors');
var app = express();
var auth = require('basic-auth');
var rhmapAuth = require('rhmap-auth');

app.use(cors());
app.engine('html', require('ejs').renderFile);

function isAuthenticated(req, res, next) {
  var user = auth(req) || { name: '', pass: '' };
  rhmapAuth(user.name, user.pass, function (err, isValid) {
    if (!err && isValid) {
      return next();
    } else {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="example"');
      res.end('Access denied');
    }
  });
}

app.use(isAuthenticated);


// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys([]));
app.use('/mbaas', mbaasExpress.mbaas);
app.use(lessMiddleware(__dirname + '/public'));
app.use(express['static'](__dirname + '/public'));

app.use(function checkRequirements(req, res, next) {
  if (!process.env.FH_LOCAL && (!process.env.FH_MONGODB_CONN_URL || process.env.FH_SERVICE_APP_PUBLIC !== 'true')) {
    console.log('FH_MONGODB_CONN_URL:', process.env.FH_MONGODB_CONN_URL, 'FH_LOCAL:', process.env.FH_LOCAL, 'FH_SERVICE_APP_PUBLIC', process.env.FH_SERVICE_APP_PUBLIC);
    return res.render('upgrade.html', {});
  }
  return next();
});

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

// fhlint-begin: custom-routes
app.use('/', apiMapper({
  transformations: {
    // Add your custom transformations here! `customMixedArrayTransform` is an example of this.
    mixedArrayTransform: require('./transformations/mixedArrayTransform.js')
  }
}));


// fhlint-end

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
module.exports = app.listen(port, host, function () {
  console.log("App started at: " + new Date() + " on port: " + port);
});