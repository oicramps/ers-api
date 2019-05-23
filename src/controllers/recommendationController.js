const express = require("express");
const { executeQuery } = require("../database/config");
const {
  getUserRecommendationsQuery,
  getUsersRatesQuery
} = require("../database/queries");
const {
  euclideanDistanceComparation
} = require("../controllers/collaborativeFilteringController");
const { mapOwlResult } = require("../utils/owlMapper");
const { getDistance } = require("geolib");

const router = express.Router();

const fetchByQuery = async query => {
  const { body } = await executeQuery(query);
  return body.results.bindings;
};

const getContentBasedRecommendations = async ({
  id: userId,
  latitude,
  longitude
}) => {
  const recommendations = await fetchByQuery(
    getUserRecommendationsQuery(userId)
  );

  return recommendations
    .map(mapOwlResult)
    .map(rec => ({
      ...rec,
      weight: getContentBasedRecommendationWeight(rec),
      distance: getDistance(
        { latitude, longitude },
        { latitude: rec.latitude, longitude: rec.longitude }
      )
    }))
    .sort((a, b) => b.weight - a.weight);
};

const getUsersRates = async userId => {
  const rates = await fetchByQuery(getUsersRatesQuery(userId));
  const mappedRates = rates.map(mapOwlResult).map(rec => ({
    ...rec,
    rate: Math.floor(Math.random() * 5) + 1
  }));

  const groupedRates = mappedRates.reduce((acc, obj) => {
    acc[obj.user_id] = { ...acc[obj.user_id], [obj.est_id]: obj.rate };

    return acc;
  }, {});

  return groupedRates;
};

const getContentBasedRecommendationWeight = ({
  rating,
  overall,
  likes,
  checkins
}) =>
  1 / 1 +
  Math.sqrt(
    parseFloat(overall) * 200 +
      (parseFloat(rating) + parseFloat(likes) + parseFloat(checkins)) / 100
  );

const generateRankedRecommendations = (
  userId,
  contentBasedRecommendations,
  usersRates
) => {
  let rankedRecommendations = [];

  Object.entries(usersRates)
    .filter(([key]) => key.toString() !== userId.toString())
    .forEach(([key, value]) => {
      const euclideanDistance = euclideanDistanceComparation(
        usersRates,
        userId.toString(),
        key.toString()
      );

      if (euclideanDistance !== 0) {
        rankedRecommendations = contentBasedRecommendations.map(rec =>
          Object.keys(value).includes(rec.id)
            ? {
                ...rec,
                basedOnUser: key,
                weight: rec.weight / (1 - euclideanDistance)
              }
            : rec
        );
      }
    });

  return rankedRecommendations.sort((a, b) => b.weight - a.weight);
};

const getRecommendations = async userInfo => {
  const contentBasedRecommendations = await getContentBasedRecommendations(
    userInfo
  );
  const usersRates = await getUsersRates(userInfo.id);
  const recommendations = await generateRankedRecommendations(
    userInfo.id,
    contentBasedRecommendations,
    usersRates
  );

  return {
    recommendations
  };
};

router.post("/", async (req, res) => {
  const result = await getRecommendations(req.body);
  return res.send(result);
});

module.exports = app => app.use("/recommendation", router);
