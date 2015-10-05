App.RequestsListView = App.BaseMapperView.extend({
  className: "requests",
  el : '.content',
  events : {
    'click tbody > tr' : 'showSavedRequest',
    'click .createRequest' : 'newRequest',
    'click .btn-delete' : 'deleteRequest'
  },
  initialize : function(){
    App.BaseMapperView.prototype.initialize.apply(this, arguments);
    this.collection = new App.RequestsCollection();
    this.collection.fetch();
    this.listenTo(this.collection, 'sync', this.render);
    this.listenTo(this.collection, 'destroy', this.render);
  },
  render : function(){
    if (this.requestView){
      return;
    }
    var tpl = Handlebars.compile($('#tplRequestsList').html());
    this.$el.html(tpl({ requests : this.collection.toJSON() }));
    return this;
  },
  showSavedRequest : function(e){
    var self = this,
    el = $(e.target),
    id, model;
    if (e.target.tagName.toLowerCase() !== 'tr'){
      if (!el.hasClass('btn-edit')){
        return;
      }
      el = el.parents('tr');  
    }
    
    id = el.data('id');
    model = this.collection.get(id);
    if (!model){
      return this.trigger('notify', 'error', 'Could not find request with id ' + id);
    }
    model.fetch({
      success : function(){
        window.history.pushState(id, "Edit Request", "/requests/" + id);
        self.showRequestView(model);    
      },
      error : function(){
        self.trigger('notify', 'error', 'Could not load request details');
      }
    });
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
      delete self.requestView;
      self.collection.fetch();
      self.render();
      window.history.pushState('', "Request List", "/");
    });
    this.$el.html(this.requestView.$el);
  },
  deleteRequest : function(e){
    var self = this,
    el = $(e.target).parents('tr'),
    id = el.data('id'), 
    model = this.collection.get(id);
    if (!model){
      return this.trigger('notify', 'error', 'Could not find request with id ' + id);
    }
    return model.destroy({
      success : function(){
        return self.trigger('notify', 'success', 'Request deleted');
      },
      error : function(){
        return self.trigger('notify', 'error', 'Could not delete request with id ' + id);
      }
    });
  }
});
