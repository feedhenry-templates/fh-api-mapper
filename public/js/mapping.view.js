App.MappingView = App.BaseMapperView.extend({
  className: "mapping",
  events : {
    
  },
  initialize : function(options){
    App.BaseMapperView.prototype.initialize.apply(this, arguments);
    this.tpl = Handlebars.compile($('#tplMappingView').html());
    this.model = options.model;
    this.request = options.request;
    this.transformations = new App.TransformationsCollection();
    this.transformations.fetch();
    this.listenTo(this.transformations, 'sync', this.render);
  },
  render : function(){
    this.$el.html(this.tpl({
      model : this.model.toJSON(),
      request : this.request.toJSON()
    }));
    this.$fieldMappings = this.$el.find('#fieldMappings');
    this.$tplFieldMappings = Handlebars.compile($('#tplFieldMappings').html());
    this.renderFieldMappings();
  },
  renderFieldMappings : function(){
    var self = this;
    if (this.transformations.length === 0){
      return self.$fieldMappings.html('Loading...');
    }
    self.$fieldMappings.html(self.$tplFieldMappings({model : this.model.toJSON(), transformations : this.transformations.toJSON()}));
    return;
  }
});
