/**
 * Template module
 */
var rootpath = process.cwd() + '/',
  path = require('path'),
  calipso = require(path.join(rootpath, 'lib/calipso'));

/**
 * Exports
 * Note that any hooks must be exposed here to be seen by Calipso
 */
exports = module.exports = {
  routes: routes,
  init: init,
  route: route,
  install: install,
  reload: reload,
  disable: disable,
  jobs: {
    templateJob: templateJob
  },
  depends:["content","contentTypes"],
  last: true,
  templatePage: templatePage
};

/**
 * Routes this module will respond to
 */
function routes() {
  return [
    {path: /.*/, fn: allPages,template: 'templateAll',block: 'side.template.all'},
    {path: 'GET /template', fn: templatePage, template: 'templateShow',block: 'content.template'},
    {path: 'GET /templateSecure', fn: templatePage, permit: calipso.permission.Helper.hasPermission('template:permission'), template: 'templateShow',block: 'content.template'}
  ];
}

/**
 * Routing function, this is executed by Calipso in response to a http request (if enabled)
 */
function route(req, res, module, app, next) {

  // Menu items
  //res.menu.primary.push({ name: 'Template', url: '/template', regexp: /template/});
  res.menu.primary.addMenuItem(req, {name:'Template',path:'template',url:'/template',description:'Template module ...',security:[]});

  // Router
  module.router.route(req, res, next);

};

/**
 * Initialisation function, this is executed by calipso as the application boots up
 */
function init(module, app, next) {

  calipso.e.addEvent('TEMPLATE_EVENT',{hookio:true});

  // Version event listeners
  calipso.e.custom('TEMPLATE_EVENT', 'PING', module.name, templatePing);
  calipso.e.pre('CONTENT_CREATE',module.name,templateEvent);
  calipso.e.post('CONTENT_CREATE',module.name,templateEvent);
  calipso.e.pre('CONTENT_UPDATE',module.name,templateEvent);
  calipso.e.post('CONTENT_UPDATE',module.name,templateEvent);
  calipso.e.pre('CONTENT_CREATE_FORM',module.name,formAlter);
  calipso.e.pre('CONTENT_UPDATE_FORM',module.name,formAlter);

  // Define permissions
  calipso.permission.Helper.addPermission("template:permission","Access to secure template page");

  next();

};

/**
 * Simple template page function
 */
function templatePage(req, res, options, next) {

  // Set any variables
  var myVariable = "Hello World";

  // Create a content item
  var item = {
    id: "NA",
    type: 'content',
    meta: {
      variable: myVariable
    }
  };

  // Raise a ping
  calipso.e.custom_emit('TEMPLATE_EVENT', 'PING', {data:'Hello', pid: process.pid }, function(eventData) {

    // Render the item via the template provided above
    calipso.theme.renderItem(req, res, options.templateFn, options.block, {
      item: item,
      options: options
    },next);

  });


};

/**
 * Every page block function
 */
function allPages(req, res, template, block, next) {

  // All available parameters
  // NOTE: This only works here because this template is last:true (see exports).
  var params = res.params;

  // Get some data (e.g. this could be a call off to Mongo based on the params
  var item = {
      variable: "Hello World",
      params: params
  };

  // Now render the output
  calipso.theme.renderItem(req, res, template, block, {
    item: item
  },next);

};

/**
 * Function called by event listeners
 */
function templateEvent(event, content, next) {

  // Content - fires
  console.log('TEMPLATE MODULE received ' + event + " @ " + content.title);
  return next();

}

/**
 * Function called by event listeners
 */
function templatePing(event, data, next) {

  console.log(process.pid + " received " + data.data + " from " + data.pid);

  // Req is passed through by the event emitter (specifically, not normally done)
  // options.req.flash('info','Fired from an ' + event + ' listener in the page rendering process ... You are: ' + (options.req.session.user ? options.req.session.user.username : " The Invisible Man/Woman!"));
  return next({data:"Goodbye",pid:process.pid});

}


/**
 * Example of a form alter
 * Adds a new section to the content create and update forms
 */
function formAlter(event,form,next) {

  // Content - fires
  var newSection = {
    id:'form-section-template',
    label:'Template Alter',
    fields:[
            {label:'Status',name:'content[template]',type:'textarea',description:'A field added dynamically to the content from by the template module'},
           ]
  }

  form.sections.push(newSection);

  return next(form);

}

/**
 * Template installation hook
 */
function install() {
  calipso.log("Template module installed");
}

/**
 * hook for disabling
 */
function disable() {
  calipso.log("Template module disabled");
}

/**
 * Admin hook for reloading
 */
function reload() {
  calipso.log("Template module reloaded");
}

/**
 * Template Job
 */
function templateJob(args, next) {
  calipso.log("Template job function called with args: " + args);
  next();
}