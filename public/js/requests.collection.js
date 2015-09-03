App.RequestsCollection = Backbone.Collection.extend({
  url: '/requests',
  model : App.RequestModel
});
