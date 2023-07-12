require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const { URL } = require("url");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//connect to the database
mongoose.connect(process.env.DB_URI, {
  useNewURLParser: true,
  useUnifiedTopology: true,
});

// define the URL model
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});

const URLS = mongoose.model("URL", urlSchema);

// use the body-parser to parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

function validateURL(url) {
  return new Promise((resolve, reject) => {
    let hostname;

    try {
      // Use the URL object to parse the url string and get the hostname
      hostname = new URL(url).hostname;
    } catch (err) {
      // If there is an error, the URL is invalid
      return reject("Invalid URL");
    }

    dns.lookup(hostname, (err) => {
      if (err) {
        // If there is an error, the URL is invalid
        reject("Invalid URL");
      } else {
        // If there is no error, the URL is valid
        resolve("Valid URL");
      }
    });
  });
}

app.post("/api/shorturl", async (req, res) => {
  const original_url = req.body.url;

  try {
    await validateURL(original_url);

    // look for the original url in the database
    const urlDoc = await URLS.findOne({ original_url: original_url });

    // if it exists, return the docs
    if (urlDoc) {
      return res.json({
        original_url: urlDoc.original_url,
        short_url: urlDoc.short_url,
      });
    }

    const count = await URLS.countDocuments();
    const short_url = count + 1;

    const url = new URLS({ original_url, short_url });
    await url.save();

    res.json({ original_url, short_url });
  } catch (err) {
    return res.status(400).json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  try {
    // Find the URL document with the short_url
    const urlDoc = await URLS.findOne({ short_url: req.params.short_url });

    if (urlDoc) {
      // If the document exists, redirect to the original URL
      return res.redirect(urlDoc.original_url);
    } else {
      return res.status(404).json({ error: "No URL found" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
