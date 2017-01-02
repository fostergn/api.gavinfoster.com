// connect to firebase

// listen to any new incoming message

// check if admin is connected
// if not, then send SMS message

var firebase = require('firebase');
var twilioConfig = require('./twilioConfig');
var twilioClient = require('twilio')(twilioConfig.accountSid, twilioConfig.authToken);

const config = {
  apiKey: "AIzaSyCOj3piZf-HrV-WjDy30WlY_F7rCLqCIAk",
  authDomain: "portfoliochat-c02b2.firebaseapp.com",
  databaseURL: "https://portfoliochat-c02b2.firebaseio.com",
  storageBucket: "portfoliochat-c02b2.appspot.com",
  messagingSenderId: "500384902525"
};

let firstMessageLoaded = false;

firebase.initializeApp(config);
const db = firebase.database();

// Get conversations
db.ref('messages')
  .orderByChild('createdOn')
  .limitToLast(1)
  .on('child_added', function(data) {
  if(!firstMessageLoaded){firstMessageLoaded = true; return;}

  const conversationId = data.val().conversationId;
  const messageText = data.val().message;

  // check if admin is active
  db.ref('conversations/' + conversationId)
    .once('value')
    .then(function(conversation) {
      const isAdminConnected = conversation.val().isAdminConnected;
      if(!isAdminConnected){
        console.log('send gavin a text message : ', messageText);
        sendMessage(messageText);
      }
    });
});

function sendMessage(msg){
  twilioClient.sendMessage({
      to:'+17032548467', //
      from: '+17032935276', // A number you bought from Twilio and can use for outbound communication
      body: msg
  }, function(err, responseData) { //this function is executed when a response is received from Twilio
      if(err){console.log('error: ', err)}
      if (!err) { // "err" is an error received during the request, if any
          console.log(responseData.from); // outputs "+14506667788"
          console.log(responseData.body); // outputs "word to your mother."
      }
  });
}
