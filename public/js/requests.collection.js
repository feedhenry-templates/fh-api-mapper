var Backbone = require('backbone'),
RequestModel = require('./request.model.js');

module.exports = Backbone.Collection.extend({
  url: '../api/requests',
  model : RequestModel
});
