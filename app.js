const { Timestamp } = require("bson");
const { timeEnd } = require("console");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
const port = 3000;

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

app.get("/addEvent", (req, res) => {
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
