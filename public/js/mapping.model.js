App.MappingModel = Backbone.Model.extend({
  idAttribute : '_id',
  url : function(){
    return '/api/requests/' + this.request.id + '/mapping';
  }
});
