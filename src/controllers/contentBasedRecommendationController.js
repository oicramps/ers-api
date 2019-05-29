const fetchByQuery = require("./databaseController");
const {
  getUserRecommendationsQuery,
  getUserCheckinsQuery
} = require("../database/queries");
const { mapOwlResult } = require("../utils/owlMapper");
const { getDistance } = require("geolib");

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

const filterNotCheckedIn = (recommendation, checkins) =>
  !checkins.includes(recommendation.id);

const getContentBasedRecommendations = async ({
  id: userId,
  latitude,
  longitude
}) => {
  const recommendations = await fetchByQuery(
    getUserRecommendationsQuery(userId)
  );

  const checkins = (await fetchByQuery(getUserCheckinsQuery(userId)))
    .map(mapOwlResult)
    .map(checkin => checkin.id);

  return recommendations
    .map(mapOwlResult)
    .filter(rec => filterNotCheckedIn(rec, checkins))
    .map(rec => ({
      ...rec,
      weight: getContentBasedRecommendationWeight(rec),
      distance: getDistance(
        { latitude, longitude },
        { latitude: rec.latitude, longitude: rec.longitude }
      )
    }));
};

module.exports = getContentBasedRecommendations;
