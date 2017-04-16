'use strict';
var Alexa = require("alexa-sdk");

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('AskSayHello');
    },
    'TestIntent': function () {
        this.emit('SayHello')
    },
    'SayHello': function () {

        var name = this.event.request.intent.slots.Name;
        var message = null;

        if (name && name.value) {
          message = 'Hello, '+name.value+'!';
        } else {
          message = 'Hello!';
        }

        this.attributes['speechOutput'] = message;
        this.emit(':tell', message);
    },
    'AskSayHello': function () {
        this.attributes['speechOutput'] = 'Should I say hello to you?';
        this.attributes['repromptSpeech'] = 'Do you want me to say hello to you or what?';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = 'You can say hello and then your name. Or you can say exit...so will you tell me your name?';
        this.attributes['repromptSpeech'] = 'will you tell me your name?';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
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
      this.attributes['speechOutput'] = 'You can say hello and then your name. Or you can say exit...so will you tell me your name?';
      this.attributes['repromptSpeech'] = 'will you tell me your name?';
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
};
