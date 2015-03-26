var EmberInsights = require('ember-insights')['default'];

Ember.Application.initializer({
  name: 'Ember-Insights.js - tracking Task-Success application',

  initialize: function (container, application) {
    EmberInsights.configure('task-success-tracking', {
      // Sends insights to the right panel.
      trackerFactory: BrowserTrackerFactory,
      // Disables setting a 'location' each time after transitions.
      updateDocumentLocationOnTransitions: false,
    }).track({
      // Sets insights for transitions between 'Task' and 'Execution' tabs.
      insights: {
        TRANSITIONS: ['index', 'execution'], ALL_ACTIONS: { except: ['tryAgain'] }
      }
    }).track({
      // Sets insights mappings for transition to 'Result' tab.
      insights: {
        TRANSITIONS: ['result']
      },
      // A `dispatch` is responsible for sending custom insight as a final result of task success
      dispatch: function(type, context, tracker) {
        var model = context.route.get('controller.model');
        // this kind of final insight which depends from model state
        var label = (model.get('isValid') ? 'successful' : 'failed')
        // sends report
        tracker.sendEvent('result', 'status', label);
        tracker.trackPageView('/result');
      }
    });
    // Start engine!
    EmberInsights.start('task-success-tracking');
  }
});
