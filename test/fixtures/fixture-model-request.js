var request = function(params){
  return { 
    save : function(cb){
      return cb(null, params);
    }
  };
};
request['@global'] = true;
request.find = function(query, cb){
  // return a mock request
  return cb(null, [{}]);
};
module.exports = request;
