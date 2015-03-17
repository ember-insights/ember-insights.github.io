// The Example App is abstract implementation as a show case of getting the 'Task Success' metric.
// The Task Success: this includes traditional behavioral metrics of user experience,
// such as efficiency (e.g. time to complete a task), effectiveness (e.g. percent of tasks completed), and error rate.
// This category is most applicable to areas of your product that are very task-focused, such as search or an upload flow.
App = Ember.Application.create({rootElement: '#example-component-container'});

App.Router.map(function() {
  this.resource('index',     { path: '/' });
  this.resource('execution', { path: '/execution' });
  this.resource('result',    { path: '/result' });
});

// disables update URL
App.Router.reopen({ location: 'none' });

App.Task = Ember.Object.extend({
  validateInput:    Ember.computed.equal('taskID', 'Mnemonics'),
  validateRadio:    Ember.computed.equal('selectedRadio', 'should'),
  validateCheckbox: Ember.computed.and('checkedOptions.s', 'checkedOptions.l'),
  isValid:          Ember.computed.and('validateInput', 'validateRadio', 'validateCheckbox'),
});

App.ExecutionRoute = Ember.Route.extend({
  model: function(){
    return App.Task.create({
      attempts:       0,
      taskID:         '',
      selectedRadio:  'must',
      checkedOptions: { s:false, o:false, l:false, i:false, d:false }
    });
  }
});

App.ResultRoute = Ember.Route.extend({
  model: function(){ return this.modelFor('execution'); }
});


App.IndexController = Ember.Controller.extend({
  actions: {
    proceed: function(){ this.transitionTo('execution'); }
  }
});

App.ExecutionController = Ember.ObjectController.extend({
  submitted:    false,
  radioButtons: { must: 'must', should: 'should', could: 'could', wont: 'wont' },

  actions: {
    submit: function(){
      this.incrementProperty('model.attempts');

      if(this.get('model.isValid') || this.get('model.attempts') > 1){
        this.transitionTo('result');
      }
    }
  }
});

App.ResultController = Ember.Controller.extend({
  actions: {
    tryAgain: function(){ this.transitionTo('index'); }
  }
});

App.RadioButtonComponent = Ember.Component.extend({
  tagName:            'input',
  type:               'radio',
  attributeBindings:  [ 'disabled', 'checked', 'name', 'type', 'value' ],

  checked: function () {
    return this.get('value') === this.get('selectedRadio');
  }.property('value', 'selectedRadio'),

  change: function () {
    this.set('selectedRadio', this.get('value'));
  }
});
