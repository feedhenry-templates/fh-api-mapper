var BaseMapperView = require('./base.view.js'),
TransformationsCollection = require('./transformations.collection.js'),
Handlebars = require('./handlebars.js'),
_ = require('underscore'),
$ = require('jquery');
jQuery = $;
require('../lib/bootstrap-treeview/bootstrap-treeview.min.js');

module.exports = BaseMapperView.extend({
  className: "mapping",
  events : {
    'change .detailView form input' : 'updateMapping',
    'change .detailView form select' : 'updateMapping'
  },
  initialize : function(options){
    BaseMapperView.prototype.initialize.apply(this, arguments);
    this.tpl = Handlebars.compile($('#tplMappingView').html());
    this.model = options.model;
    this.request = options.request;
    this.listenTo(this.model, 'sync', this.renderTree);
  },
  render : function(){
    this.$el.html(this.tpl({
      model : this.model.toJSON(),
      request : this.request.toJSON()
    }));
    this.$tplFieldMapping = Handlebars.compile($('#tplFieldMapping').html());
    this.renderTree();
  },
  renderTree : function(){
    var treeData = this.buildTree(this.model.toJSON()),
    treeEl = $(this.$el.find('.treeView')),
    tree; 
    if (!treeData.fields.length && (!treeData.nodes || !treeData.nodes.length)){
      return;
    }
        
    tree = treeEl.treeview({
      data: treeData.nodes,
      levels : (treeData.nodes.length === 1) ? 2 : 1,
      showTags : true,
      expandIcon : 'fa fa-chevron-right',
      collapseIcon: 'fa fa-chevron-down',
      selectedBackColor : '#d6ecf9',
      selectedColor : '#6c696a'
    });
    
    if (this.selectedNode){
      // first expand every parent..
      parentId = this.selectedNode.parentId;
      while (parentId){
        this.tree.treeview('expandNode', parentId);  
        parentId = this.tree.treeview('getNode', parentId).parentId;
      }
      this.tree.treeview('selectNode', this.selectedNode.nodeId);
    }
    
    this.tree = tree;
    tree.on('nodeSelected', jQuery.proxy(this.nodeSelected, this));
    tree.treeview('selectNode', this.selectedNode || 0);
  },
  nodeSelected : function(e, field){
    this.selectedNode = field;
    if (field.href === false){
      // Don't allow the sellecting of the placeholder for array item maps
      // instead always select it's first child
      var  firstChildNode = _.first(field.nodes),
      id = firstChildNode.nodeId;
      this.selectedNode = firstChildNode;
      this.toggleExpanded(e, field);
      return this.tree.treeview('selectNode', id);
    }
    this.$el.find('.detailView').html(this.$tplFieldMapping({ field : field }));
    if (field.nodes && field.nodes.length > 0){
      this.toggleExpanded(e, field);
    }
    if (field.transformation){
      this.$el.find('select[name=transformation]').val(field.transformation);
    }
  },
  toggleExpanded : function(e, field){
    this.tree.treeview('toggleNodeExpanded', field.nodeId);
  },
  removeMapping : function(){
    var self = this;
    this.model.destroy({
      success : function(){
        self.trigger('removed');
        self.remove();
      },
      error : function(){
        self.trigger('notify', 'error', 'Error removing mapping from request');
      }
    });
  },
  iconForType : function(type){
    var icon = '';
    switch(type){
      case 'string':
        icon = '\" \"';
        break;
      case 'number':
        icon = '123';
        break;
      case 'boolean':
        icon = this.fa('check') + ' ' + this.fa('times');
        break;
      case 'object':
        icon = '{ }';
        break;
      case 'array':
        icon = '[ ]';
        break;
      default:
        icon = '?';
        break;  
    }
    return icon;
  },
  buildTree : function(model){
    var nodes = _.map(model.fields, this.buildTree, this),
    iconForType = this.iconForType(model.type),
    iconName = (model.use) ? 'check' : 'times',
    use = this.fa(iconName),
    name = model.from || 'Root',
    tree;
    use = '<div class="treeWrap ' + iconName + '">' + use + '</div>';
    if (model.from && model.to && model.from !== model.to){
      name += '<small> &rarr;' + model.to + '</small>';
    }
    // wrap the name tag so we can style it
    name = '<div class="treeNodeName">' + name + '</div>';
    tree = {
      href : model._id,
      text : name,
      tags : [iconForType, use],
      state : {}
    };
    
    if (model.element && model.element.fields && model.element.fields.length){
      nodes = [{
        href : false,
        backColor : '#ccc',
        text : '<div class="treeNodeName">(Array Items)</div>',
        state : {},
        nodes : this.buildTree(model.element).nodes
      }];      
    }
    
    // Nodes not in use should have all their children inaccessible
    if (model.use === false){
        nodes.forEach(function(node){
          node.state.disabled = true;
          node.tags = [];
        });
    }
    
    // Arrays which have a transformation per-element applied do not get sub-fields
    if (model.type === 'array' && model.transformation){
      nodes.forEach(function(node){
        node.state = {};
        node.state.disabled = true;
        node.text = "<small>Disable transformations to edit sub fields</small>";
      });
    }
    
    
    // don't set nodes to [], or it'll show as expandible
    if (nodes.length && nodes.length > 0){
      tree.nodes = nodes;
    }
    // Mix in all the additional metadata from the mapping
    tree = _.extend(tree, model);
    return tree;
  },
  updateMapping : function(e){
    if (e){
      e.preventDefault();
      e.stopPropagation();
    }
    var self = this,
    el = $(e.target),
    name = el.attr('name'),
    value = el.val(),
    mappingItemId = el.parents('form').data('id'),
    updateObject = {};
    updateObject[name] = value;
    if (name === 'use'){
      updateObject = { use : el.prop('checked') };
    }
    
    if (updateObject.transformation === 'none' || updateObject.transformation === 'No transformation'){
      updateObject.transformation = null;
    }
    
    var updatedMapping = this.updateMappingEntryById(this.model.toJSON(), mappingItemId, updateObject);
    
    this.model.save(updatedMapping, {
      success : function(){
        self.notify('success', 'Mapping updated');
        self.trigger('updated');
      },
      error : function(){
        self.notify('error', 'Error saving update to mapping');
      }
    });
  },
  updateMappingEntryById : function(mapping, itemId, updateObject){
    if (mapping._id === itemId){
      return _.extend(mapping, updateObject);
    }
    var fields = mapping.fields,
    arrayFields = mapping.element && mapping.element.fields;
    for (var i=0; i < fields.length; i++){
      fields[i] = this.updateMappingEntryById(fields[i], itemId, updateObject);
    }
    if (arrayFields){
      for (var j=0; j<arrayFields.length; j++){
        arrayFields[j] = this.updateMappingEntryById(arrayFields[j], itemId, updateObject);
      }
    }
    return mapping;
  }
});
