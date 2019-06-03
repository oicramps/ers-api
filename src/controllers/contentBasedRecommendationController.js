const fetchByQuery = require("./databaseController");
const {
  getUserRecommendationsQuery,
  getUserCheckinsQuery,
  getEstablishmentsByIds
} = require("../database/queries");
const { mapOwlResult } = require("../utils/owlMapper");
const { getDistance } = require("geolib");

function normalize(
  enteredValue,
  minEntry = 0,
  maxEntry = 1000,
  normalizedMin = 1,
  normalizedMax = 100
) {
  var mx = (enteredValue - minEntry) / (maxEntry - minEntry);
  var preshiftNormalized = mx * (normalizedMax - normalizedMin);
  var shiftedNormalized = preshiftNormalized + normalizedMin;

  return shiftedNormalized;
}

const getContentBasedRecommendationWeight = ({
  rating,
  overall,
  likes,
  checkins,
  priceRange
}) =>
  normalize(
    1 / 1 +
      Math.sqrt(
        (parseFloat(rating) * parseFloat(overall) +
          parseFloat(likes) +
          parseFloat(checkins)) /
          priceRange
      )
  );

const filterNotCheckedIn = (recommendation, checkins = []) =>
  !checkins.includes(recommendation.id);

const groupWorkPeriod = (acc, rec) => {
  const foundRec = acc.find(accRec => accRec.id === rec.id);
  if (!foundRec) {
    return [...acc, { ...rec, workPeriod: [rec.workPeriod] }];
  } else {
    return [
      ...acc.filter(accRec => accRec.id !== rec.id),
      { ...foundRec, workPeriod: [...foundRec.workPeriod, rec.workPeriod] }
    ];
  }
};

const mapEstablishmentRecommendations = (
  recommendations,
  checkins,
  latitude,
  longitude
) =>
  recommendations
    .map(mapOwlResult)
    .reduce(groupWorkPeriod, [])
    .filter(rec => !checkins || filterNotCheckedIn(rec, checkins))
    .map(rec => ({
      ...rec,
      weight: getContentBasedRecommendationWeight(rec),
      distance: getDistance(
        { latitude, longitude },
        { latitude: rec.latitude, longitude: rec.longitude }
      )
    }));

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

  return mapEstablishmentRecommendations(
    recommendations,
    checkins,
    latitude,
    longitude
  );
};

const getEstablishmentRecommendationsByIds = async (
  establishmentIds,
  { latitude, longitude }
) => {
  const establishments = await fetchByQuery(
    getEstablishmentsByIds(establishmentIds)
  );

  return mapEstablishmentRecommendations(
    establishments,
    null,
    latitude,
    longitude
  );
};

module.exports = {
  getContentBasedRecommendations,
  getEstablishmentRecommendationsByIds
};
