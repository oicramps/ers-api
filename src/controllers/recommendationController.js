const { query } = require("stardog");
const express = require("express");
const { executeQuery } = require("../database/config");
const {
  getUserRecommendationsQuery,
  getUsersRatesQuery
} = require("../database/queries");
const { groupBy } = require("../utils/collectionHelper");

const { mapOwlResult } = require("../utils/owlMapper");

const router = express.Router();

const fetchByQuery = async query => {
  const { body } = await executeQuery(query);
  return body.results.bindings;
};

const getContentBasedRecommendations = async userId => {
  const recommendations = await fetchByQuery(
    getUserRecommendationsQuery(userId)
  );

  return recommendations.map(mapOwlResult);
};

const getUsersRates = async userId => {
  const rates = await fetchByQuery(getUsersRatesQuery(userId));
  const mappedRates = rates.map(mapOwlResult).map(rec => ({
    ...rec,
    rate: Math.floor(Math.random() * 5) + 1
  }));

  return groupBy(
    mappedRates.map(rec => ({
      user_id: rec.user_id,
      [rec.est_id]: rec.rate
    })),
    "user_id"
  );
};

const getRecommendations = async userInfo => {
  const recommendations = await getContentBasedRecommendations(userInfo.id);
  const usersRates = await getUsersRates(userInfo.id);

  return usersRates;
};

router.post("/", async (req, res) => {
  const result = await getRecommendations(req.body);
  return res.send(result);
});

module.exports = app => app.use("/recommendation", router);
