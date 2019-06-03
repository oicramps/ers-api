const express = require("express");
const bodyParser = require("body-parser");
const recommendationController = require("./controllers/recommendationController");
const { port } = require("./config/environment");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

recommendationController(app);

app.listen(port);
console.log(`Recommendation System is running on: ${port}`);
