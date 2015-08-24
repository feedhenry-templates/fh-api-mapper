var request = require('request');
request({
  url: '__URL__',
  method: '__METHOD__',
  headers : __HEADERS__,
  data: __DATA__;
}, function (error, response, body) {
  if (error) {
    return console.error('An error occured:', error);
  }
  console.log('Server responded with:', body);
});