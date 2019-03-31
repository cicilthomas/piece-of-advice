/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk-core')
const https = require('https');

/* const for keeping the state */
const ASKED_FOR_ANOTHER_ADVICE = 'ASKED_FOR_ANOTHER_ADVICE';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    console.log('Inside LaunchRequestHandler, transferring to AdviceIntentHandler');
    /* Transfer the request to AdviceIntentHandler to give a random advice. */
    return AdviceIntentHandler.handle(handlerInput);
  },
};

const AdviceIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AdviceIntent';
  },
  async handle(handlerInput) {
    console.log('Inside AdviceIntentHandler');
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    var searchQuery, advice;

    /* Check for a specific advice topic */
    if(isSlotFilled(request)) {
      searchQuery = request.intent.slots.adviceType.value;
      console.log(`Search Query: ${searchQuery}`);
    }

    const options = buildAdviceOptions(searchQuery);
    const response = await httpGet(options);
    /* If the response is for a search then return the first advice */
    if(response && response.total_results 
      && response.slips && response.slips[0] && response.slips[0].advice) {
        if (parseInt(response.total_results) > 0) {
          advice = response.slips[0].advice;
        } 
        else {
          advice = `I'm sorry I couldn't find an advice on ${searchQuery}. Shall I give you a random advice? `;
        }
    } 
    /* If the response is for a random advice  */
    else if(response && response.slip && response.slip.advice) {
      advice = response.slip.advice;
    } 
    /* If no advice is found return a predefined advice */
    else {
      advice = 'Once you find a really good friend don\'t do anything that could mess up your friendship.';
    }

    /* Set the STATE = 'ASKED_FOR_ANOTHER_ADVICE' so that AnotherAdviceYesIntentHandler can easily verify */
    sessionAttributes.STATE = ASKED_FOR_ANOTHER_ADVICE;
    attributesManager.setSessionAttributes(sessionAttributes);
    console.log(`Advice: ${advice}`);
    
    return handlerInput.responseBuilder
      .speak(advice)
      .reprompt('Do you want another one?')
      .withSimpleCard('Advice of the day', advice)
      .getResponse();
  },
};

const AnotherAdviceYesIntentHandler = {
  canHandle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
      && sessionAttributes && sessionAttributes.STATE && sessionAttributes.STATE === ASKED_FOR_ANOTHER_ADVICE;
  },
  handle(handlerInput) {
    console.log('Inside AnotherAdviceYesIntentHandler, transferring to AdviceIntentHandler ');
    /* Transfer the request to AnotherAdviceYesIntentHandler */
    return AdviceIntentHandler.handle(handlerInput);
  },
};

const AnotherAdviceNoIntentHandler = {
  canHandle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent'
      && sessionAttributes && sessionAttributes.STATE && sessionAttributes.STATE === ASKED_FOR_ANOTHER_ADVICE;
  },
  handle(handlerInput) {
    console.log('Inside AnotherAdviceNoIntentHandler, transferring to CancelAndStopIntentHandler');
    /* Transfer the request to CancelAndStopIntentHandler */
    return CancelAndStopIntentHandler.handle(handlerInput);
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    console.log('Inside HelpIntentHandler');
    const speechText = 'You can ask me for a random advice, or an advice on a specific topic like. ' +
      'Give me an advice on friendship, or tell me an advice about life. So what would you like?';

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
    console.log('Inside CancelAndStopIntentHandler');
    const speechText = 'Bye!';

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
    console.log('Inside FallbackHandler');

    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    /* Set the STATE = 'ASKED_FOR_ANOTHER_ADVICE' so that AnotherAdviceYesIntentHandler can easily verify */
    sessionAttributes.STATE = ASKED_FOR_ANOTHER_ADVICE;
    attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak('I\'m sorry I can\'t help you with that. ' +
        'Shall I give you a random advice?')
      .reprompt('Shall I give you a random advice?')
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log('Inside SessionEndedRequestHandler');
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const UnhandledHandler = {
  canHandle(handlerInput) {
    return true;
  },
  handle(handlerInput) {
    console.log('Inside UnhandledHandler, transferring to FallbackHandler');
    /* Transfer the request to FallbackHandler */
    return FallbackHandler.handle(handlerInput);
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log('Inside ErrorHandler');
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
    AnotherAdviceYesIntentHandler,
    AnotherAdviceNoIntentHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
    UnhandledHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();