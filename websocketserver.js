const WebSocket = require('ws');
const Redis = require("ioredis");
const subscriber = new Redis();
let subscribed = [];

const wss = new WebSocket.Server({
  noServer: true,
  path: "/stream"
})

wss.on("connection", (ws) => {
  ws.on("error", () => {
    console.error;
  })
  ws.on("message", (data) => {
    data = JSON.parse(data.toString());
    if (data.event === "subscribe") {
      if(subscribed.includes(ws)) {
        ws.send('You have already subscribed!');
        return;
      }
      subscribed.push(ws);
      ws.send('Subsciption succeeded!')
      return;
    }
    if (data.event === "unsubscribe") {
      if(!subscribed.includes(ws)) {
        ws.send('You haven\'t subscribed!');
        return;
      }
      let i = 0;
      for(; i<subscribed.length; i++) {
        if(subscribed[i] === ws) {
          break;
        }
      }
      subscribed.splice(i, 1);
      ws.send('Unsubscription succeeded!');
    }
  })
  ws.on("close", () => {
    ws.close();
  })
})

subscriber.subscribe("channel1", (err) => {
  if(err) {
    console.error;
  };
})

subscriber.on("message", (_channel, message) => {
  subscribed.forEach((member) => {
    member.send(message);
  });
})

module.exports = wss;