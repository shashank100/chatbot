var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "my-chat-bot") {
  //if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

app.listen(port, function () {
  console.log('Example app listening on port: '+ port)
});
