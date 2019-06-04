const express = require("express");
const {
  getContentBasedRecommendations
} = require("./contentBasedRecommendationController");
const {
  getCollaborativeFilteringRecommendations
} = require("./collaborativeFilteringController");
const { filterRecommendationsByContext } = require("./contextController");

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
  ].sort((a, b) => b.weight - a.weight);
};

const getRecommendations = async userInfo => {
  const contentBasedRecommendations = await getContentBasedRecommendations(
    userInfo
  );
  const recommendations = await generateRankedRecommendations(
    userInfo,
    contentBasedRecommendations
  );

  const filteredRecommendations = await filterRecommendationsByContext(
    userInfo,
    recommendations
  );

  return {
    recommendations: filteredRecommendations,
    count: {
      content: filteredRecommendations.filter(rec => !rec.basedOn).length,
      collaborative: filteredRecommendations.filter(rec => !!rec.basedOn).length
    }
  };
};

router.post("/", async (req, res) => {
  return res.send(await getRecommendations(req.body));
});

module.exports = app => app.use("/recommendation", router);
