'use strict';
var Alexa = require('alexa-sdk');
var unirest = require('unirest');
require('dotenv').config();

var AVAILABLE_STATUS = 'undelegated inactive';
var FOR_SALE_STATUS = 'active marketed';
var DOMAINR_URL = 'https://domainr.p.mashape.com/v2/';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = process.env.APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('Explain');
    },
    'DomainIntent': function () {
        this.emit('FindDomain')
    },
    'FindDomain': function () {
        var self = this;
        var domain = self.event.request.intent.slots.Domain;

        if (!(domain && domain.value)) {
          self.emit('Explain'); // just explain if no domain is sent
        } else {
          // if there's no TLD, then add a default ".com"
          if (!domain.value.includes('.')) {
            domain.value = domain.value.concat('.com');
          }

          // use the domainr API to get the status of the domain
          mashapeGetRequest('status', domain.value, function(statusResult) {
              var message = '';

              if (statusResult.body.status.length > 0) {
                if (statusResult.body.status[0].status == AVAILABLE_STATUS) {
                  // If it's available, just tell the user and that's it
                  self.attributes['speechOutput'] = 'The domain ' + domain.value + ' is available!';
                  self.emit(':tell', message);
                } else { // Not available
                  // If it's for sale, add that to the message
                  var forSaleMessage = (statusResult.body.status[0].status == FOR_SALE_STATUS) ? ', but is for sale' : '';
                  message = 'The domain ' + domain.value + ' is not available' + forSaleMessage + '.';

                  // Get related domains
                  mashapeGetRequest('search', domain.value, function(suggestionsResult) {
                    if (suggestionsResult.body.results.length > 0) {
                      var statusQueryDomains = [];
                      for (var i = 0; i < suggestionsResult.body.results.length; i++) {
                        if (suggestionsResult.body.results[i].domain != domain.value) { // Don't suggest the domain they asked for
                          statusQueryDomains.push(suggestionsResult.body.results[i].domain);
                        }
                      }

                      var statusQueryString = statusQueryDomains.join(encodeURIComponent(','));

                      // Get the status of all related domains
                      mashapeGetRequest('status', statusQueryString, function(suggestionsStatusResult) {
                        if (suggestionsStatusResult.body.status.length > 0) {
                          var suggestedDomains = [];
                          for (var i = 0; i < suggestionsStatusResult.body.status.length; i++) {
                            if (suggestionsStatusResult.body.status[i].status == AVAILABLE_STATUS) {
                              suggestedDomains.push(suggestionsStatusResult.body.status[i].domain);
                            }
                          }

                          if (suggestedDomains.length === 0) { // If none of the related domains are available
                            self.attributes['speechOutput'] = message + ' No available related domains were found.';
                            self.emit(':tell', self.attributes['speechOutput']);
                          } else { // At least one domain was found
                            var suggestionsString = statusQueryDomains.join(', ');
                            self.attributes['speechOutput'] = message + ' Here is a list of suggested available alternatives: ' + suggestionsString;
                            self.emit(':tell', self.attributes['speechOutput']);
                          }

                        } else { // Didn't get statuses for suggested domains
                          this.emit('Error');
                        }
                      });
                    } else { // No related domains found
                      this.emit('Error');
                    }
                  });
                }
              } else { // not found
                this.emit('Error');
              }
          });

        }
    },
    'Explain': function () {
        this.attributes['speechOutput'] = 'You can ask me if any domain is available, and I will tell you if it is. And I\'ll give relevant suggestions if it\'s not.';
        this.attributes['repromptSpeech'] = 'Ask me something like: "Is caleb.com available?"';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.HelpIntent': function () {
        this.emit('Explain');
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', 'Goodbye.');
    },
    'Unhandled': function () {
      this.emit('Explain');
    },
    'Error': function () {
      self.attributes['speechOutput'] = 'There was a problem while searching domains. Please try again.';
      self.emit(':tell', self.attributes['speechOutput']);
    }
};

function mashapeGetRequest(type, domain, callback) {
  // Build URL based on type
  var url = DOMAINR_URL + type + '?' + (type == 'search' ? 'query=' : 'domain=');
  // Send request and return results
  unirest.get(url + domain)
  .header('X-Mashape-Key', process.env.MASHAPE_KEY)
  .header('Accept', 'application/json')
  .end(function(result) {
    callback(result);
  });
}
