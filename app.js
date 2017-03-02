/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'),
  app = express();
app.set('view engine', 'ejs');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

// Bootstrap application settings
require('./config/express')(app);

const imageRe = /\.(jpg|png|gif|svg)$/;
const audioRe = /\.(wav|flac|ogg|opus)$/;
const resourcesDir = path.join(__dirname, 'public/resources');

app.get('/', function(req, res) {
  fs.readdir(resourcesDir, (err, files) => {
    if (err) {
      console.log(err);
      res.status(500).end('Error reading files list');
    }

    const fileGroups = _.groupBy(files, function(file) {
      if (imageRe.test(file)) {
        return 'images';
      } else if (audioRe.test(file)) {
        return 'audio'
      } else {
        return 'other'
      }
    });
    res.render('index', fileGroups);
  });
});

// for testing Speech to Text async callbacks
const sttCallbackGenerator = require('./speech-to-text-async');
app.use('/speech-to-text-async/insecure', sttCallbackGenerator());
app.use('/speech-to-text-async/secure', sttCallbackGenerator('ThisIsMySecret'));


// backwards-compatibility fixes for now-renamed files
app.get('/resources/audio.ogg', (req, res) => res.sendFile(path.join(__dirname, 'public/resources/text-to-speech-output.ogg')));
app.get('/resources/audio.wav', (req, res) => res.sendFile(path.join(__dirname, 'public/resources/weather.wav')));
app.get('/resources/tts-output.ogg', (req, res) => res.sendFile(path.join(__dirname, 'public/resources/text-to-speech-bad-request.ogg')));

module.exports = app;
