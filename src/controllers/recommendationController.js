const express = require("express");
const {
  getContentBasedRecommendations
} = require("./contentBasedRecommendationController");
const {
  getCollaborativeFilteringRecommendations
} = require("../controllers/collaborativeFilteringController");

const router = express.Router();

const generateRankedRecommendations = async (
  userInfo,
  contentBasedRecommendations
) => {
  const collaborativeFilteringRecommendations = await getCollaborativeFilteringRecommendations(
    userInfo,
    contentBasedRecommendations
  );

  return [
    ...contentBasedRecommendations,
    ...collaborativeFilteringRecommendations
  ]
    .filter(rec => !userInfo.radius || rec.distance <= userInfo.radius)
    .sort((a, b) => b.weight - a.weight);
};

const getRecommendations = async userInfo => {
  const contentBasedRecommendations = await getContentBasedRecommendations(
    userInfo
  );
  const recommendations = await generateRankedRecommendations(
    userInfo,
    contentBasedRecommendations
  );

  return {
    recommendations
  };
};

router.post("/", async (req, res) => {
  return res.send(await getRecommendations(req.body));
});

module.exports = app => app.use("/recommendation", router);
