App.BaseMapperView = Backbone.View.extend({
  initialize : function(){
    this.listenTo(this, 'notify', this.notify);
    this.tplNotification = Handlebars.compile($('#tplNotification').html());
  },
  notify : function(className, message){
    if (!message){
      message = className;
      className = 'info';
    }
    var notification = $(this.tplNotification({ message : message, className : className }));
    this.$el.append(notification);
    setTimeout(function(){
      notification.fadeOut({
        complete : function(){
          notification.remove();
        }
      });
    }, 2500);    
  }
});
