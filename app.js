const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var cors = require("cors");
const bodyParser = require("body-parser");
const {
  devpost_scrape,
  devfolio_scrape,
  eventbrite_scrape,
} = require("./scraper/scraper");
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://event-radar-frontend.vercel.app/",
      "http://localhost:3000",
    ],
  })
);

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const eventSchema = {
  registrationLink: String,
  name: String,
  collegeId: String,
  eventMode: String,
  typeOfEvent: String,
  eventFeeType: String,
  fee: String,
  startDate: Number,
  endDate: Number,
  description: String,
};

const collegeSchema = {
  collegeId: String,
  events: Array,
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Events = mongoose.model("Events", eventSchema);
const Colleges = mongoose.model("Colleges", collegeSchema);
const User = mongoose.model("User", userSchema);

app.post("/scrape", function (req, response) {
  var url = req.body.url;

  try {
    if (url.includes("devpost")) {
      devpost_scrape(url).then((data) => {
        response.send(data);
      });
    } else if (url.includes("eventbrite")) {
      eventbrite_scrape(url).then((data) => {
        response.send(data);
      });
    } else {
      response.send({ name: "", description: "" });
    }
  } catch (e) {
    response.send({ name: "", description: "" });
  }
});

app.post("/addEvent", (req, res) => {
  const eventData = req.body;
  console.log(eventData);

  let event = new Events(eventData);

  event
    .save()
    .then((eventDoc) => {
      console.log(eventDoc.id);
      Colleges.findOneAndUpdate(
        { collegeId: eventData.collegeId },
        { $push: { events: eventDoc.id } },
        { upsert: true, new: true }
      )
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
    })
    .catch(() => {
      res.json({
        success: false,
      });
    });
});

app.get("/getEvents", (req, res) => {
  console.log("called");
  Events.find({})
    .then((events) => {
      console.log({ events });
      res.json(events);
    })
    .catch((err) => {
      console.log("error");

      res.json({});
    });
});

app.get("/getEvent/:id", (req, res) => {
  const eventId = req.params.id;
  console.log(`getEvent called with id ${eventId}`);

  Events.findById(eventId)
    .then((event) => {
      console.log({ event });
      res.json(event);
    })
    .catch((err) => {
      console.log(`Error: ${err.message}`);
      res.json({});
    });
});

app.get("/getColleges", (req, res) => {
  console.log("called");
  Colleges.find({})
    .then((events) => {
      console.log({ events });
      res.json(events);
    })
    .catch((err) => {
      console.log("error");

      res.json({});
    });
});

app.post("/login", (req, res) => {
  console.log("login called");
  const { email, password } = req.body;

  // Find the user with the specified email
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Compare the user's input password with the hashed password
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Server error" });
        }

        if (!result) {
          return res.status(400).json({ error: "Invalid credentials" });
        }

        res.json({ success: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server error" });
    });
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  // Generate a salt for password hashing
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }

    // Hash the password using the salt
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
      }

      // Create a new user object with the hashed password
      const newUser = new User({ email, password: hash });

      // Save the new user to the database
      newUser
        .save()
        .then(() => {
          res.json({ success: true });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: "Server error" });
        });
    });
  });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
``;
