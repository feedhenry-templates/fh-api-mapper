module.exports = {
  capitalize : require('./capitalize'),
  lowercase : require('./lowercase'),
  round : require('./round'),
  sum : require('./sum'),
  invert : require('./invert'),
  _set : function(name, transformation){
    this[name] = transformation;
  }
};
