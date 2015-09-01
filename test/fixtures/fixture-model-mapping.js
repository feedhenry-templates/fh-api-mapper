var mapping = function(params){
  return { 
    save : function(cb){
      return cb(null, params);
    }
  };
};
mapping['@global'] = true;
mapping.find = function(query, cb){
  // return a mock mapping
  return cb(null, [{}]);
};
module.exports = mapping;
