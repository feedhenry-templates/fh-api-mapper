App.RequestsCollection = Backbone.Collection.extend({
  url: '/api/requests',
  model : App.RequestModel
});
