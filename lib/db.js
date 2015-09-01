var mongoose = require('mongoose');

module.exports = function(){
  // fh-mbaas-api should set this sensibly for us
  if (!process.env.FH_MONGODB_CONN_URL){
    throw new Error('No database connection URL found - please set FH_MONGODB_CONN_URL');
  }
  mongoose.connect(process.env.FH_MONGODB_CONN_URL);
  var connection = mongoose.connection;
  connection.on('error', function(err) {
    console.error('Mongo error: ' + require('util').inspect(err));
  });

  connection.once('open', function callback() {
    console.log('Mongoose Connected.');
  });

  connection.on('disconnected', function() {
    console.error('Mongoose Disconnected');
  });
  return connection;  
};
