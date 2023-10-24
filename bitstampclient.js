const WebSocket = require('ws');
const Redis = require("ioredis");
const Mutex = require('async-mutex').Mutex;
const bitsampClient = new WebSocket('wss://ws.bitstamp.net');
const publisher = new Redis();
const mutex = new Mutex();

bitsampClient.on('open', () => {
  const currencyPairs = ["btcusd", "xrpusd", "ltcusd", "ethusd", "grtusd", "solusd", "crvusd", "apeusd", "dotusd", "dogeusd"];
  for(let i=0; i <currencyPairs.length; i++) {
    let subscribeMessage = {
      "event": "bts:subscribe",
      "data": {
          "channel": `live_trades_${currencyPairs[i]}`
      }
    }
    bitsampClient.send(JSON.stringify(subscribeMessage));
  }
});

bitsampClient.on('message', async(data) => {
  data = JSON.parse(data.toString());
  if(data.event === "trade") {
    data = {
      pair: (data.channel).substring(12),
      price: data.data.price,
      timestamp: data.data.timestamp
    }
    const OHLC = (data.pair) + ":" + ((data.timestamp) - (data.timestamp % 60));
    await mutex.runExclusive(async ()=> {
      let OHLCInfo  = await publisher.hgetall(OHLC);
      if(Object.keys(OHLCInfo).length === 0) {
        OHLCInfo = {
          open: data.price,
          high: data.price,
          low: data.price,
          close: data.price
        }
        await publisher.hset(OHLC, OHLCInfo);
        await publisher.expireat(OHLC,  (parseInt(data.timestamp) - (parseInt(data.timestamp) % 60) + 15 * 60));
      } else {
        OHLCInfo.close = data.price;
        if(OHLCInfo.high < data.price) {
          OHLCInfo.high = data.price;
        }
        if(OHLCInfo.low > data.price) {
          OHLCInfo.low = data.price;
        }
        await publisher.hset(OHLC, OHLCInfo);
      }
      data.OHLC = OHLCInfo;
      publisher.publish("channel1", JSON.stringify(data));
    })
  }
});

bitsampClient.on('error', () => {
  console.error
});

module.exports = bitsampClient;