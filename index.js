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
  const msgTxt = msg.startsWith('data:') ? 'Client sent an image.' : msg;
  const msgMediaUrl = msg.startsWith('data:') ? msg : '';
  twilioClient.sendMessage({
      to:'+17032548467',
      from: '+17032935276',
      body: msgTxt,
      MediaUrl: msgMediaUrl,
  }, function(err, responseData) {
      if(err){console.log('error: ', err)}
      console.log('response: ', responseData);
  });
}

function addMessageToFirebase(message){
  sendWithConversationId(conversationId, function(){
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
  console.log('running send with conversation');
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
    console.log('conversation id exists: ', conversationId);
    cb(conversationId);
  }
}

// ROUTING
var router = express.Router();

router.post('/sms/inbound', function(req, res) {
    var messageBody = req.body.Body;
    addMessageToFirebase(messageBody);
    res.status(204).header('Content-Type','text/xml').send();
});

app.use('/v1', router);

app.listen(port);
console.log('Magic happens on port ' + port);
