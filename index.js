var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var superagent = require("superagent");

app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
    console.log("in here");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

function processMessage(event) {
    var senderId = event.sender.id,
        payload = encodeURI(event.message.text);

    superagent
        .get("https://api.api.ai/api/query?v=20150910&lang=en&sessionId=mySession&query=" + payload)
        .set("Authorization", "Bearer " + process.env.API_CLIENT_TOKEN)
        .end(function(err, res) {
            console.log(res.result.parameters.date);
            console.log(res.result.parameters.SunSigns);
        });
}

app.post("/webhook", function (req, res) {
console.log(process.env.VERIFY_TOKEN);

  // checking if it is a page subscription
  console.log(req.body)
  if (req.body.object === "page") {
    // Iterate over each entry
    // There may be multiple batched entries
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          processMessage(event);
        }
      });
    });
    res.sendStatus(200);
  }
});

app.listen(port, function () {
  console.log('Example app listening on port: '+ port)
});
