var _ = require('underscore'),
map = require('./map.js'),
headersToRequestFormat = function(headers){
  var newHeaders = {};
  if (_.isObject(headers) && !_.isArray(headers)){
    return headers;
  }
  if (!headers || headers.length === 0){
    return newHeaders;
  }
  headers.forEach(function(h){
    if (!h.key){
      return;
    }
    newHeaders[h.key.toLowerCase()] = h.value || "";
  });
  return newHeaders;
};

module.exports = function(requestObject, debug, cb){
  var request = require('request'),
  method = requestObject.method && requestObject.method.toLowerCase(),
  headers = headersToRequestFormat(requestObject.headers),
  json, rawHttpRequest, rawHttpResponse, r;

  // Ensure we convert out of a mongoose document
  if (requestObject.toObject){
    requestObject = requestObject.toObject();
  }

  if (_.isFunction(debug)){
    cb = debug;
    debug = false;
  }

  if (!requestObject.url || !method){
    return cb({ code : 400, message : 'All requests must contain a URL and Method' });
  }

  if (!request.hasOwnProperty(method)){
    return cb({code : 405, message : 'Method ' + method + ' is not supported'});
  }

  if (_.isObject(requestObject.body))
  {
    requestObject.body = JSON.stringify(requestObject.body);
  }

  if (headers.hasOwnProperty('content-type') && headers['content-type'] === 'application/json'){
    json = true;

    if (typeof requestObject.body === "string")
    {
      requestObject.body = JSON.parse(requestObject.body);
    }
  }

  r = request[method]({
    url : requestObject.url,
    headers : headers,
    body : requestObject.body,
    json :json
  }, function(error, response, body){
    if (error){
      error.code = 400;
      return cb(error);
    }
    var mapping = requestObject.mapping,
    mapped;

    if (typeof body === 'string' && response.headers.hasOwnProperty('content-type') && response.headers['content-type'].indexOf('application/json')>-1){
      try{
        body = JSON.parse(body);
      }catch(err){
        console.error('Error parsing JSON from response: ' + err);
      }
    }

    // Perform the mapping - just passes back the body if a mapping isn't possible
    mapped = map(mapping, body);

    return cb(null, {
      request : {
        headers : headers,
        raw : rawHttpRequest
      },
      response : {
        statusCode : response.statusCode,
        headers : response.headers,
        mapped : mapped,
        body : body,
        raw : rawHttpResponse
      }
    });
  });

  // For all real requests, don't listen for request debug information
  if (!debug){
    return;
  }

  // If we're "try"ing a request, get the raw request and response
  rawHttpRequest = '';
  rawHttpResponse = '';

  // Listen to all request body write events
  var oldWriteFunction = request.Request.prototype.write;
  request.Request.prototype.write = function(data){
    rawHttpRequest += data.toString();
    oldWriteFunction.apply(this, arguments);
  };

  r.once('socket', function(socket){
    // Once the socket is assigned, prepend the headers
    rawHttpRequest = socket._httpMessage._header + rawHttpRequest;



    // Every ondata event, append to our raw request buffer
    // NB this can't be achieved by socket.on('data') in 0.10..
    if (process.version.match(/^v0\.10/)){
      var oldOnDataFunction = socket.ondata;
      socket.ondata = function(buf, start, end) {
        rawHttpResponse += buf.slice(start, end).toString();
        return oldOnDataFunction.apply(this, arguments);
      };
    }else{
      socket.on('data', function(data){
        rawHttpResponse += data.toString();
      });
    }



  });
};
