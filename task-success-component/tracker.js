var AbstractTracker = require('trackers/abstract-tracker')['default'];
var GoogleTracker   = require('trackers/google')['default'];
var adhocTrackerFactory = function(settings) {
  var googleTracker = GoogleTracker.factory(settings);
  var numFadingIn = 0;
  var logger = function(label, params) {
    var message = 'tracker.%@(%@)'.fmt(label, JSON.stringify(params));
    var $new = $('<li style="display:none;" class="collection-item"> <blockquote><small>' + message + '</small></blockquote></li>');
    $('#task-success-app-output', applicationContainer.parentNode.parentNode).prepend($new);
    numFadingIn++;
    setTimeout(function(){
      $new.show('slow', function() { numFadingIn--; });
    }, (numFadingIn-1) * 500);
    googleTracker[label].apply(googleTracker, params);
  };

  var Tracker = AbstractTracker.extend({
    getTracker: function() {
      return logger;
    },
    set: function(key, value) {
      logger('set', [key, value]);
    },
    send: function(fieldNameObj) {
      logger('send', [fieldNameObj]);
    },
    sendEvent: function(category, action, label, value) {
      logger('sendEvent', [category, action, label, value]);
    },
    trackPageView: function(path, fieldNameObj) {
      logger('trackPageView', [path, fieldNameObj]);
    },
    applyAppFields: function() {
      logger('applyAppFields', [settings.fields]);
    }
  });
  return new Tracker();
};
