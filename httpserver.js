const express = require('express');
const app = express()
const port = 3000;

app.get('/',(req, res, next) => {
  res.status(200).json({message: "successs"});
})

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({message: "server error"});
})

const myServer = app.listen(port, () => {
  console.log(`App is listening at port ${port}`);
})

module.exports = myServer;