/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk-core')
const https = require('https');


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Once you find a really good friend don\'t do anything that could mess up your friendship.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const AdviceIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AdviceIntent';
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    var searchQuery, advice;

    /* Check for a specific advice topic */
    if(isSlotFilled(request)) {
      searchQuery = request.intent.slots.adviceType.value;
    }

    const options = buildAdviceOptions(searchQuery);
    const response = await httpGet(options);

    if(response && response.total_results && parseInt(response.total_results) > 0
      && response.slips && response.slips[0] && response.slips[0].advice) {
        advice = response.slips[0].advice;
    } 
    else if(response && response.slip && response.slip.advice) {
      advice = response.slip.advice;
    } 
    else {
      advice = 'Once you find a really good friend don\'t do anything that could mess up your friendship.';
    }
    console.log(advice);
    return handlerInput.responseBuilder
      .speak(advice)
      .reprompt(advice)
      .withSimpleCard('Advice of the day', advice)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can ask me for a random advice, or an advice on a specific topic like. ' +
      ' Give me an advice on friendship. So what would you like?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Advice of the day', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const FallbackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('I\'m sorry I can\'t help you with that. ' +
        'I can give you an advice instead. ')
      .reprompt('What size and temperament are you looking for?')
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error : ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

function buildAdviceHttpPath(searchQuery) {

  return `/advice${searchQuery?'/search/' + searchQuery:''}`;
}

function buildAdviceOptions(searchQuery) {

  return {
    host: 'api.adviceslip.com',
    port: 443,
    path: buildAdviceHttpPath(searchQuery),
    method: 'GET',
    timeout: 7000,
  }
}

function isSlotFilled(request) {
  return request && request.intent && request.intent.slots 
    && request.intent.slots.adviceType && request.intent.slots.adviceType.value
}

function httpGet(options) {
  return new Promise(((resolve, reject) => {
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
      }

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
}


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    AdviceIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
