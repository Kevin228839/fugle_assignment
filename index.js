const myServer = require('./httpserver');
const wss = require('./websocketserver');
require('./bitstampclient');

myServer.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  })
})