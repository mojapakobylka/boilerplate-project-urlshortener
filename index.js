require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient } = require("mongodb");
const dns = require("dns");
const urlparser = require("url");

const client = new MongoClient(process.env.DB_URL);
const db = client.db("urlshortener");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", function (req, res) {
  console.log(req.body + "/nend of first log");
  const url = req.body.url;
  
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (error, addresses) => {
    console.log(addresses + "/nend of second log");
    if (!addresses) {
      res.json({ error: "invalid url" });
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        shortUrl: urlCount,
      };

      const result = await urls.insertOne(urlDoc);
      console.log(result + "/nend of third log");
      res.json({ original_url: req.body.url, short_url: urlCount });
    }
  });
});

app.get("/api/shorturl/:shortUrl", async (req,res) => {
  const parameterValue = req.params.shortUrl;
  
  const parsedOriginalUrl = await urls.findOne(
    {shortUrl: +parameterValue}
  );
  
  res.redirect(parsedOriginalUrl.url)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
