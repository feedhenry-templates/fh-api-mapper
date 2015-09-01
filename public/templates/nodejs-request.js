var request = require('request');
request(__REQUEST_PARAMS__, function (error, response, body) {
  if (error) {
    return console.error('An error occured:', error);
  }
  console.log('Server responded with:', body);
});