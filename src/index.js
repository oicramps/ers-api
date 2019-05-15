const express = require("express");
const bodyParser = require("body-parser");
const recommendationController = require("./controllers/recommendationController");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

recommendationController(app);

app.listen(3030);
