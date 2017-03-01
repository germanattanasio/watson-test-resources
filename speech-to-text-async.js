'use strict';
const Router = require('express').Router;
const crypto = require('crypto');
const join = require('path').join;
const bodyParser = require('body-parser');

// mount this file at an express endpoint (see app.js)

// callback route generator
// accepts an optional secret that enables signature validation
module.exports = function(secret) {
  // http://expressjs.com/en/4x/api.html#router
  const router = new Router();

  // note: may need to use bodyParser.Raw here rather than .json() so that we can check the signature against the raw body
  router.use(bodyParser.json());

  // local cache of recent events, for displaying on the web page
  // WARNING: this only makes sense for a simple single server, single process demo
  // For real-world usage, you'll probably want to store the results in a database or similar
  const events = [];
  const MAX_EVENTS = 20;

  // render a page with recent events
  router.get('/', function(req, res) {
    if (req.query.challenge_string) {
      events.unshift({
        warning: `${req.baseUrl} called with a challenge_string - the callback URL is ${join(req.baseUrl, '/callback')}`
      });
      if (events.length > MAX_EVENTS) {
        events.length = MAX_EVENTS;
      }
    }
    res.render('stt-async', { // views/stt-async.ejs
      callbackUrl: join(req.baseUrl, '/callback'), // path that the router was mounted on
      secret: secret, // normally you would *not* pass this to views. but this is for a demo
      events: events
    });
  });

  // set up event-logging middleware
  router.use('/callback/', (req, res, next) => {
    const event = {
      timestamp: new Date(),
      method: req.method,
      'X-Callback-Signature': req.headers['x-callback-signature'] || '(header not sent)',
      url: req.originalUrl,
      statusCode: 200, // default, will be overwritten later in the event of errors
      response: '' // not sent yet, will be overwritten later
    };
    if (req.method === 'POST') {
      event.body = req.body;
    }
    events.unshift(event);
    if (events.length > MAX_EVENTS) {
      events.length = MAX_EVENTS;
    }
    req.event = event;
    // wrap the status and send methods with ones that log their contents first
    const status = res.status;
    res.status = function(statusCode) {
      event.statusCode = statusCode;
      return status.call(res, statusCode);
    };
    const send = res.send;
    res.send = function(response) {
      event.response = response;
      return send.call(res, response);
    };
    next();
  });

  // if a secret is provided, set up middleware to validate it
  // also use raw body parsing so that the JSON parsing doesn't break the signature
  if (secret) {
    router.use((req, res, next) => {

      const signature = req.headers['x-callback-signature'];
      if (!signature) {
        return res.status(400).type('.txt').send('Error: missing required X-Callback-Signature header');
      }

      const content = req.method === 'POST' ? JSON.stringify(req.body) : req.query.challenge_string;
      if (!content) {
        return res.status(400).type('.txt').send('Error: no content to validate signature on');
      }

      console.log('validating X-Callback-Signature: %s', signature);

      const hmac = crypto.createHmac('sha1', secret);
      hmac.update(content);
      const expectedSignature = hmac.digest('base64');
      if (signature === expectedSignature) {
        next();
      } else {
        // it would be insecure to put the expected signature in the response, but we can log it (assuming the logs are secure)
        const error = `X-Callback-Signature mismatch! actual: ${signature}, expected: ${expectedSignature}`;
        console.log(error);
        if (req.event) {
          req.event.error = error;
        }
        res.status(400).send("Error: X-Callback-Signature header did not match expected value");
      }
    });
  }


  // GET is used to validate the callback when registering, a random token is included in the query that must be present in the response
  // http://www.ibm.com/watson/developercloud/doc/speech-to-text/async.shtml#register
  router.get('/callback', function(req, res) {
    const challenge = req.query.challenge_string;
    const signature = req.headers['x-callback-signature'];

    console.log('Speech to Text async callback registration - challenge_string: %s', challenge);

    res.type('.txt');

    if (!challenge) {
      res.status(400).send(`GET requests to ${join(req.baseUrl, '/callback')} must include a challenge_string querystring param with an arbitrary value`);
    }

    // the watson service must see the challenge response in the output in order to register this endpoint as a callback url
    res.send(challenge);
  });

  // POST is used to notify the callback when a job is complete
  // http://www.ibm.com/watson/developercloud/doc/speech-to-text/async.shtml#notifications
  router.post('/callback', function(req, res) {
    console.log('Speech to Text async callback triggered - body:', req.body);
    // normally you'd do something with the result here.
    res.status(200).send('');
  });

  return router;
};
