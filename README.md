# Chat SMS Server

This is a Node application that listens to a firebase realtime database and pushes SMS messages based on certain conditions ( if an Admin is not connected to a conversation )

## Getting Started
Run npm install & npm start

`npm install`

`pm2 start index.js --name "sms-server"`

To run with all CPU
`pm2 start index.js -i 0 --name "sms-server"`

To stop the app
`pm2 stop sms-server`

To restart the app
`pm2 restart sms-server`
