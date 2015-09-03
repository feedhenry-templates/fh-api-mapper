var log = App.logger;

App.RequestsListView = App.BaseMapperView.extend({
  className: "requests",
  el : '.container-fluid',
  events : {
    'click tr' : 'showSavedRequest',
    'click button' : 'newRequest'
  },
  initialize : function(){
    App.BaseMapperView.prototype.initialize.apply(this, arguments);
    this.collection = new App.RequestsCollection();
    this.collection.fetch();
    this.listenTo(this.collection, 'sync', this.render);
  },
  render : function(){
    var tpl = Handlebars.compile($('#tplRequestsList').html());
    this.$el.html(tpl({ requests : this.collection.toJSON() }));
  },
  showSavedRequest : function(){
    
  },
  newRequest : function(){
    
  }
});
