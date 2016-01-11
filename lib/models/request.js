var mongoose = require('mongoose'),
Schema = require('mongoose').Schema,
validators = require('mongoose-validators'),
requester = require('../requester'),
Mapping = require('./mapping');


var capitalize = function(val){
  return val.toUpperCase();
},
RequestModel,
Header = new Schema({
  key : {
    type : String
  },
  value : {
    type : String
  }
}),
RequestSchema = new Schema({
  url: {
    type: String,
    required: true,
    validate : validators.isURL()
  },
  method: {
    type: String,
    required: true,
    "enum" : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    set: capitalize
  },
  headers : {
    type : [Header]
  },
  body : {
    type : String
  },
  mapping : {    
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mapping'
  },
  mountPath : {
    type : String,
    unique : true, // TODO: Can't expose multiple operations on one mount path at present...
    validate : {
      validator: function(mP){
        /*
         A note on edge cases here. 
         We need to match:
         /sys /sys/ /sys/anything/else
         But not:
         /system  /sysfoobar/other/stuff
         */
        var sysRouteRexex = /^\/sys(\/.+|\/)?$/,
        mbaasRouteRegex = /^\/mbaas(\/.+|\/)?$/;
        if (mP === '/'){
          return false;
        }
        
        if (mP.match(sysRouteRexex) || mP.match(mbaasRouteRegex)){
          return false;
        }
        return /^\/([/.a-zA-Z0-9-]+)?$/.test(mP);
      },
      message: '{VALUE} is not a valid mount path! Note `/sys/*`, `/mbaas/*` and `/` are reserved paths.'
    }
  }
});

RequestSchema.methods.createMapping = function(requestObject, cb) {
  var request = this;
  return requester(requestObject, false, function(err, requestResult){
    if (err){
      return cb(err);
    }
    if (!requestResult || !requestResult.response || !requestResult.response.body){
      return cb('No response body was found from this request');
    }
    if (typeof requestResult.response.body !== 'object'){
      return cb('Only JSON response mappings are supported');
    }
    
    var responseBody = requestResult.response.body;
    Mapping.createFromResponse(responseBody, function(err, newMapping){
      if (err){
        return cb(err);
      }
      request.mapping = newMapping._id;
      return request.save(function(err){
        if (err){
          return cb(err);
        }
        return cb(null, newMapping);
      });
    });
  });
};

RequestSchema.methods.removeMapping = function(cb){
  var request = this;
  Mapping.findOne({_id : request.mapping}).remove(function(err, removedMapping){
    if (err){
      return cb(err);
    }
    request.mapping = null;
    return request.save(function(err){
      if (err){
        return cb(err);
      }
      return cb(null, removedMapping);
    });
  });
};
RequestSchema.post('update', function(){
  RequestModel.schema.emit('update', this._update.$set);
});
RequestSchema.post('save', function(model){
  RequestModel.schema.emit('save', model);
});


mongoose.model('Header', Header);
RequestModel = mongoose.model('Request', RequestSchema);
module.exports = RequestModel;
