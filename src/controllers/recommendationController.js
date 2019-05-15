const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  return res.send("Altos restaurante");
});

module.exports = app => app.use("/recommendation", router);
