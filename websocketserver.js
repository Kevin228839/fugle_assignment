const WebSocket = require('ws');

const wss = new WebSocket.Server({
  noServer: true
})

wss.on('connection', (ws) => {
  ws.send('Welcome!');
})

module.exports = wss;