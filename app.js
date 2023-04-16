const express = require("express");
const mongoose = require("mongoose");
var cors = require("cors");
const bodyParser = require("body-parser");
const { devpost_scrape, devfolio_scrape, eventbrite_scrape } = require("./scraper/scraper");
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const eventSchema = {
  name: String,
  description: String,
  fees: Number,
  startDate: String,
  endDate: String,
  venue: String,
  price: Array,
  socials: {
    instagram: String,
    linkedin: String,
    website: String,
  },
  registrationLink: String,
};

const Events = mongoose.model("Events", eventSchema);

app.post("/scrape", function (req, response) {
  var url = req.body.url;

  if (url.includes("devpost")) {
    devpost_scrape(url).then((data) => {
      response.send(data);
    });
  } else if (url.includes("devfolio")) {
    devfolio_scrape(url).then((data) => {
      response.send(data);
    });
  } else if (url.includes("eventbrite")) {
    eventbrite_scrape(url).then((data) => {
      response.send(data);
    });
  }

});

app.post("/addEvent", (req, res) => {
  const eventData = req.body;

  const event = {
    name: eventData.name,
    description: eventData.description,
    fees: eventData.fees,
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    venue: eventData.venue,
    price: eventData.price,
    socials: eventData.socials,
    registrationLink: eventData.registrationLink,
  };

  let event2 = new Events(event);
  event2
    .save()
    .then(() => {
      res.json({
        success: true,
      });
    })
    .catch(() => {
      res.json({
        success: false,
      });
    });
});

app.get("/getEvents", (req, res) => {
  Events.find({})
    .then((events) => {
      res.json(events);
    })
    .catch((err) => {
      res.json({});
    });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
``;
