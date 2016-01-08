var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  idAttribute : '_id',
  url : function(){
    var url = '/api/requests/' + this.request.id + '/mapping';
    if (this.id){
      url += '/' + this.id;
    }
    return url;
  }
});
