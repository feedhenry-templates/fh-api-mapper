var App = {};
$(function(){
  var path = window.location.pathname || "",
  id, model;
  // replace last trailing /
  path = path.replace(/\/$/, "");
  path = path.split('/');
  id = _.last(path);
  
  // Always have requestsListView as the bottom view in the stack
  var listView = new App.RequestsListView().render();
  
  if (!path || !id || id.length !== 24){
    return;
  }
  
  model = new App.RequestModel({ _id : id });
  model.fetch({ 
    success : function(){ 
      listView.showRequestView(model);
    },
    failure : function(){
      listView.notify('failure', 'Failed to load request with id ' + id);
    } 
  });
  
  
  
  
});
