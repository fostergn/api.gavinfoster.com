#!/usr/bin/env nodejs
var twilioConfig = require('./twilioConfig');
var twilioClient = require('twilio')(twilioConfig.accountSid, twilioConfig.authToken);
var express = require('express');
var db = require('./firebaseConfig');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;
var conversationId = '';

let firstMessageLoaded = false;

// Get conversations
db.ref('messages')
  .orderByChild('createdOn')
  .limitToLast(1)
  .on('child_added', function(data) {
  if(!firstMessageLoaded){firstMessageLoaded = true; return;}

  conversationId = data.val().conversationId;
  const messageText = data.val().message;
  const messageAuthor = data.val().author;

  // only send messages from client
  if(messageAuthor === 'admin'){return;}

  // check if admin is active
  db.ref('conversations/' + conversationId)
    .once('value')
    .then(function(conversation) {
      const isAdminConnected = conversation.val().isAdminConnected;
      if(!isAdminConnected){
        sendMessage(messageText);
      }
    });
});

function sendMessage(msg){
  console.log('sending message : ', msg);
  twilioClient.sendMessage({
      to:'+17032548467', //
      from: '+17032935276', // Twilio Number
      body: msg
  }, function(err, responseData) { //this function is executed when a response is received from Twilio
      if(err){console.log('error: ', err)}
      console.log('response: ', responseData);
  });
}

function addMessageToFirebase(message){
  console.log('adding message to firebase: ', message);
  console.log('adding message to firebase with conversation id: ', conversationId);
  sendWithConversationId(conversationId, function(){
    console.log('sending w/ convo id: ', conversationId);
    db.ref('messages').push({
      author: 'admin',
      message,
      conversationId,
      createdOn: Date.now(),
    }, function(){
      console.log('success');
    })
  })
}

function sendWithConversationId(conversationId, cb){
  // if conversation id hasn't been set
  if (conversationId === '' || (typeof conversationId === 'undefined')){
    db.ref('messages')
      .orderByChild('createdOn')
      .limitToLast(1)
      .once('value')
      .then(function(messages) {
        messages.forEach(function(message) {
          conversationId = message.val().conversationId;
          console.log('converation id has not been set: ', conversationId);
          cb(conversationId);
        });
      });
  } else {
    console.log('conversation id exists: ', converesationId);
    cb(conversationId);
  }
}

// ROUTING
var router = express.Router();

router.post('/sms/inbound', function(req, res) {
    var messageBody = req.body.Body;
    addMessageToFirebase(messageBody);
    // res.json({ message: 'successful response' });
    res.status(200).header('Content-Type','text/xml').send();
});

app.use('/api/v1', router);

app.listen(port);
console.log('Magic happens on port ' + port);
