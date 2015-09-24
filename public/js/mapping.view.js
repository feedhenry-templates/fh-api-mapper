App.MappingView = App.BaseMapperView.extend({
  className: "mapping",
  events : {
    
  },
  initialize : function(options){
    App.BaseMapperView.prototype.initialize.apply(this, arguments);
    this.tpl = Handlebars.compile($('#tplMappingView').html());
    //TODO: Support existing
    this.model = options.model;
    this.request = options.request;
    
    // TODO: successfully tried events need to update this view
    //this.listenTo(this.request, 'success', this.onRequestTried);
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
    this.request.getLastSuccess(function(err, data){
      if (err){
        return self.$fieldMappings.html('Request must complete successfully to perform a mapping');
      }
      var body = data.response.body;
      if (!body || !_.isObject(body)){
        return self.$fieldMappings.html('Request must return JSON to perform a mapping');
      }
      var fields = [];
      _.each(body, function(value, key){
        fields.push({
          value : value,
          type : _.isArray(value) ? 'array' : typeof value,
          from : key
        });
      });
      self.$fieldMappings.html(self.$tplFieldMappings({ fields : fields }));
    });
  }
});
