const express = require('express');
const axios = require('axios');
const app = express()
const port = 3000;

app.get('/data', async(req, res, next) => {
  try {
    let data = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
    data = data.data;
    const number = data.filter((element) => (element % parseInt(req.query.user)) === 0);
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