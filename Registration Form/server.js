const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const app = express();
const SERVER_PORT = 8080;

const dbName = "accounts";
const collectionName = "accountsCollection";

const dbName2 = "positionsDatabase";
const collectionName2 = "positionsCollection";

const options = {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
  socketTimeoutMS: 3000,
  useUnifiedTopology: true,
};

async function client() {
  MongoClient.connect(process.env.atlasURL, options)
    .then((client) => {
      console.log("Connect to Database...");
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      const db2 = client.db(dbName2);
      const collection2 = db2.collection(collectionName2);

      app.set("view engine", "ejs");
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(express.static("public"));

      app.get("/", (request, response) => {
        response.sendFile(__dirname + "/index.html");
      });
      app.post("/query", (request, response) => {
        var name = request.body.name;
        var username = request.body.username;
        var password = request.body.password;
		var latitude = getLatitude(42.870334, 42.877175);
        var longitude = getLongitude(25.299582, 25.322242);
        collection
          .insertOne(
            { Name: name, Username: username, Password: password },
            function (err, result) {
              if (err) {
                console.log(err);
                return;
              }
            }
          )
          .catch((error) => {
            var results = { info: `Грешка: ${error.message}`, status: "fail" };
            response.render("index.ejs", { results: results });
          })
          .then((docs) => {
            var title = `Регистрацията мина успешно. \n${name}  ${username}`;
            var results = { title: title, docs: docs, status: "ok" };
            response.render("index.ejs", { results: results });
          });

        collection2
          .insertOne(
            { Username: username, Latitude: latitude, Longitude: longitude },
            function (err, result) {
              if (err) {
                console.log(err);
                return;
              }
            }
          )
          .catch((error) => {
            var results = { info: `Грешка: ${error.message}`, status: "fail" };
            response.render("index.ejs", { results: results });
          })
          .then((docs) => {
            var title = `Регистрацията мина успешно. \n${name}  ${username}`;
            var results = { title: title, docs: docs, status: "ok" };
            response.render("index.ejs", { results: results });
          });
      });

      app.listen(SERVER_PORT, () => {
        console.log(`Start listening on port ${SERVER_PORT}...`);
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
}
(async () => {
  await client();
})();

function getLatitude(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(8));
}

function getLongitude(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(8));
}