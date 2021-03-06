var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require("body-parser");
var superagent = require("superagent");
var sign = "leo";
var date = [];

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


function sendHoroscope(event, horoscope) {
    superagent
        .post("https://graph.facebook.com/v2.9/me/messages?access_token=" + process.env.PAGE_ACCESS_TOKEN)
        .send({
          recipient: {id: event.sender.id},
          message: {text: horoscope},
        })
        .end(function(err, res) {
            if(err) {
                console.log("Error sending message: " + res.error);
            }
        });
}

function getHoroscope(event) {
    var horoscopeDate = "today";
    var dateToday = new Date();
    if(date > dateToday.getUTCDate()) {
        horoscopeDate = "tomorrow"
    } else if (date > dateToday.getUTCDate()) {
        horoscopeDate = "yesterday"
    }
    superagent
        .get("http://sandipbgt.com/theastrologer/api/horoscope/" + sign + "/" + horoscopeDate)
        .end(function(err, res) {
            var text = JSON.parse(res.text);
            sendHoroscope(event, text.horoscope);
        }.bind(this));
}

function processMessage(event) {
    var senderId = event.sender.id,
        payload = encodeURI(event.message.text);

    superagent
        .get("https://api.api.ai/api/query?v=20150910&lang=en&sessionId=mySession&query=" + payload)
        .set("Authorization", "Bearer " + process.env.API_CLIENT_TOKEN)
        .end(function(err, res) {
            sign = res.body.result.parameters.SunSigns;
            date = Number(res.body.result.parameters.SunSigns.split("-")[2]);
            getHoroscope(event);
        }.bind(this));
}

app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", function (req, res) {
  // checking if it is a page subscription
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
