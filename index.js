require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const validator = require('validator');
const cors = require("cors");
const app = express();

// URL Database and counter for short_url
let urlDatabase = {};
let id = 1;
// Basic Configuration
const port = process.env.PORT || 3000;

// use the body-parser to parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

function isValidHttpUrl(http_url) {
  try {
    const url = new URL(http_url);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

 // Validate the URL
  if (!isValidHttpUrl(originalUrl)){
    res.status(400).json({error: "invalid url"});
  }
  //check if url is already in the database
  const foundKey = Object.keys(urlDatabase).find(
    (key) => urlDatabase[key] === originalUrl);
  if (foundKey) {
    res.json({
      original_url: originalUrl,
      short_url: foundKey,
    });
  } else {
    // assign the next id as short_urk and store it in the url database
    urlDatabase[id] = originalUrl;
    res.json({
      original_url: originalUrl,
      short_url: id,
    });
    id++;
  }
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  const shortUrl = req.params.shorturl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send("Short URL not found");
  }
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
