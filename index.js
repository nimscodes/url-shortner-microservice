require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// URL Database and counter for short_url
let urlDatabase = {};
let id = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

// use the body-parser to parse application/json
app.use(bodyParser.json())
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("api/shorturl", (req, res) => {

});


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
