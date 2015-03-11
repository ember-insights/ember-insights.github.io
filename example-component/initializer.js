Ember.Application.initializer({
  name: 'Ember-Insights.js',
  initialize: function (container, application) {
    // EmberInsights configuration for getting user-centered insights
    var EmberInsights = require('ember-insights')['default'];
    EmberInsights.configure('demo', {
      trackingNamespace: 'TaskSuccessComponent',
      // this is a kind tricky stuff which is able to drop insights directly to the right pane
      trackerFactory: adhocTrackerFactory,
      // disables setting 'location' each time after transitions
      updateDocumentLocationOnTransitions: false,
      // sets application fields
      fields: { appName: 'TaskSuccessComponent', appVersion: 'v0.1.1' }
    // sets insights mappings for transitions between 'Task' and 'Execution' tabs
    // includes sending all of actions
    }).track({
      insights: {
        TRANSITIONS: ['index', 'execution'], ALL_ACTIONS: { except: ['tryAgain'] }
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
