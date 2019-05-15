const { query } = require("stardog");
const express = require("express");
const stardogConn = require("../database/config");
const { getUserRecommendationsQuery } = require("../database/queries");

const router = express.Router();

const fetchRecommendations = async userId => {
  const { body } = await query.execute(
    stardogConn,
    "ERS",
    getUserRecommendationsQuery(userId),
    "application/sparql-results+json",
    {
      limit: 10,
      offset: 0,
      reasoning: true
    }
  );

  return body.results.bindings;
};

const mapRecommendation = rec => {
  return Object.entries(rec)
    .map(([key, value]) => ({
      [key]: value.value
    }))
    .reduce((obj, item) => {
      const [key, value] = Object.entries(item)[0];
      obj[key] = value;
      return obj;
    }, {});
};

const getContentBasedRecommendations = async userInfo => {
  const recommendations = await fetchRecommendations(userInfo.id);

  return recommendations.map(mapRecommendation);
};

router.post("/", async (req, res) => {
  const result = await getContentBasedRecommendations(req.body);
  return res.send(result);
});

module.exports = app => app.use("/recommendation", router);
