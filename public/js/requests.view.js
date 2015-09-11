App.RequestsListView = App.BaseMapperView.extend({
  className: "requests",
  el : '.content',
  events : {
    'click tbody tr' : 'showSavedRequest',
    'click .createRequest' : 'newRequest'
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
  showSavedRequest : function(e){
    var el = $(e.target),
    id, model;
    el = (e.target.tagName.toLowerCase() === 'tr') ? el : el.parents('tr');
    id = el.data('id');
    model = this.collection.get(id);
    if (!model){
      return this.trigger('notify', 'error', 'Could not find request with id ' + id);
    }
    window.history.pushState(id, "Edit Request", "/requests/" + id);
    this.showRequestView(model);
  },
  newRequest : function(){
    window.history.pushState("new", "New Request", "/requests/new");
    this.showRequestView(new App.RequestModel());
  },
  showRequestView : function(model){
    var self = this;
    this.requestView = new App.RequestView({
      model : model
    });
    this.listenTo(this.requestView, 'back', function(){
      self.requestView.remove();
      self.collection.fetch();
      self.render();
      window.history.back();
    });
    this.requestView.render();
    this.$el.html(this.requestView.$el);
  }
});
