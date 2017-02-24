'use strict';
var Router = require('express').Router;
const crypto = require('crypto');
var bodyParser = require('body-parser');

// mount this file at an express endpoint (see app.js)

// midleware generator
function validateSignature(secret) {
  return function (req, res, next) {

    var signature = req.headers['x-callback-signature'];
    if (!signature) {
      res.status(400).type('.txt').send('Error: missing required X-Callback-Signature header');
    }

    var content = req.method === 'POST' ? JSON.stringify(req.body) : req.query.challenge_string;
    if (!content) {
      res.status(400).type('.txt').send('Error: no content to validate signature on');
    }

    console.log('validating X-Callback-Signature: %s', signature);

    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(content);
    var expectedSignature = hmac.digest('base64');
    if (signature === expectedSignature) {
      next();
    } else {
      console.log('X-Callback-Signature mismatch! actual: %s, expected: $s', signature, expectedSignature);
      res.status(400).send("Error: X-Callback-Signature header did not match expected value");
    }
  }
}

// callback route generator
// accepts an optional secret that enables signature validation
module.exports = function(secret) {
  var router = new Router();


  // note: may need to use bodyParser.Raw here rather than .json() so that we can check the signature against the raw body
  router.use(bodyParser.json());

  // if a secret is provided, set up middleware to validate it
  // also use raw body parsing so that the JSON parsing doesn't break the signature
  if (secret) {
    router.use(validateSignature(secret));
  }

  // GET is used to validate the callback when registering, a random token is included in the query that must be present in the response
  // http://www.ibm.com/watson/developercloud/doc/speech-to-text/async.shtml#register
  router.get('/', function(req, res) {
    var challenge = req.query.challenge_string;
    var signature = req.headers['x-callback-signature'];

    console.log('Speech to Text async callback registration - challenge_string: %s', challenge);

    res.type('.txt');

    if (!challenge) {
      res.status(400).send("GET requests to %s must include a challenge_string querystring param with an arbitrary value", callbackUrl);
    }

    // the watson service must see the challenge response in the output in order to register this endpoint as a callback url
    res.send(challenge);
  });

  // POST is used to notify the callback when a job is complete
  // http://www.ibm.com/watson/developercloud/doc/speech-to-text/async.shtml#notifications
  router.post('/', function(req, res) {
    console.log('Speech to Text async callback triggered - body:', req.body);
    // normally you'd do something with the result here.
    res.status(200).send('');
  });

  return router;
};
