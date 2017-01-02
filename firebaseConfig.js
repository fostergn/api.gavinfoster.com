var firebase = require('firebase');

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

module.exports = db;
