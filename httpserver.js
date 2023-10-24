const express = require('express');
const axios = require('axios');
const rateLimiter = require('./ratelimit');
const app = express()
const port = 3000;

app.use('/data', rateLimiter);

app.get('/data', async(req, res, next) => {
  try {
    const userId = req.query.user;
    if(userId === undefined) {
      throw new Error("userId undefined");
    }
    let data = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
    data = data.data;
    const number = data.filter((element) => (element % parseInt(userId)) === 0);
    res.status(200).json({result: number});
  } catch(err) {
    next(err);
  }
})

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({message: "server error"});
})

const myServer = app.listen(port, () => {
  console.log(`App is listening at port ${port}`);
})

module.exports = myServer;