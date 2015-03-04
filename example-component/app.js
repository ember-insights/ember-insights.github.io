Ember.Application.initializer({
  name: 'Ember-Insights.js',
  initialize: function (container, application) {
    // EmberInsights configuration for getting user-centered insights
    var EmberInsights = require('ember-insights')['default'];
    EmberInsights.configure('demo', {
      // this is a kind tricky stuff which is able to drop insights directly to the right pane
      trackerFactory: customOutputTrackerFactory
    // sets insights mappings for transitions between 'Task' and 'Execution' tabs
    // includes sending all of actions
    }).track({
      insights: {
        TRANSITIONS: ['index', 'execution'], ALL_ACTIONS: true
      }
    // defines insights mappings for transition to 'Result' tab. The `handler` is responsible for sending final result
    // this is advanced insight builder as you can see
    }).track({
      insights: {
        TRANSITIONS: ['result']
      },
      handler: function(type, context, tracker) {
        var model = context.route.get('controller.model');
        var label, value;
        // this kind of final insight depends from model state
        if (model.get('isValid')) {
          label = 'success';
          value = { first_attempt: model.get('firstAttempt'), second_attempt: model.get('secondAttempt') };
        }
        else {
          label = 'failed';
          value = { errors: model.errors() };
        }
        // sends a task success report
        tracker.sendEvent('result_page', 'complete', label, value);
      }
    });
    // Start engine!
    EmberInsights.start('demo');
  }
});
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

App.Router.reopen({ location: 'none' });

App.Task = Ember.Object.extend({
  validateInput:    Ember.computed.equal('taskID', 'Mnemonics'),
  validateRadio:    Ember.computed.equal('selectedRadio', 'should'),
  validateCheckbox: Ember.computed.and('checkedOptions.s', 'checkedOptions.l'),
  isValid:          Ember.computed.and('validateInput', 'validateRadio', 'validateCheckbox'),
  firstAttempt:     Ember.computed.equal('attempts', 1),
  secondAttempt:    Ember.computed.equal('attempts', 2),

  errors: function() {
    var errors = {};
    if (!this.get('validateRadio')) {
      errors.selectedRadio = this.get('selectedRadio');
    }
    if (!this.get('validateInput')) {
      errors.taskID = this.get('taskID');
    }
    if (!this.get('checkedOptions.s')) {
      errors.notChecked = ['s'];
    }
    if (!this.get('checkedOptions.l')) {
      errors.notChecked = errors.notChecked || [];
      errors.notChecked.push('l');
    }
    return errors;
  }
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
    next: function(){ this.transitionTo('execution'); }
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
    restart: function(){ this.transitionTo('index'); }
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
