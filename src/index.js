const express = require("express");
const bodyParser = require("body-parser");
const dotEnv = require("dotenv");
const recommendationController = require("./controllers/recommendationController");

const app = express();
dotEnv.config();

const port = process.env.PORT || 3030;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

recommendationController(app);

app.listen(port);
console.log(`Recommendation System is running on: ${port}`);
