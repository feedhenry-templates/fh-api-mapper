var Backbone = require('backbone'),
Handlebars = require('./handlebars.js'),
$ = require('jquery');
module.exports = Backbone.View.extend({
  initialize : function(){
    this.listenTo(this, 'notify', this.notify);
    this.tplNotification = Handlebars.compile($('#tplNotification').html());
  },
  notify : function(className, message){
    if (!message){
      message = className;
      className = 'info';
    }
    var notification = $(this.tplNotification({ message : message, className : className })),
    width;
    this.$el.find('.alert').remove();
    this.$el.prepend(notification);
    width = notification.parent().width();
    notification.css({
      position : 'fixed',
      width : width,
      'z-index' : 1000
    });
    setTimeout(function(){
      notification.fadeOut({
        complete : function(){
          notification.remove();
        }
      });
    }, 2500);    
  },
  fa : function(classname){
    return '<span class="fa fa-' + classname + '"></span>';
  }
});
