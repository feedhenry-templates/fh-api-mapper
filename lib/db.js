var mongoose = require('mongoose');

function connect() {
  //returns itself every 2 seconds if env var is not defined
  if (!process.env.FH_MONGODB_CONN_URL){
    return setTimeout(connect, 2000);
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
}

module.exports = connect;
