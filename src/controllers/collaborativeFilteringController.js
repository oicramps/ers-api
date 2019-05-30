const { getUsersRatesQuery } = require("../database/queries");
const {
  getEstablishmentRecommendationsByIds
} = require("./contentBasedRecommendationController");
const { mapOwlResult } = require("../utils/owlMapper");
const fetchByQuery = require("./databaseController");

const euclideanDistanceComparation = (dataset, p1, p2) => {
  if (![p1, p2].every(item => dataset[item])) return 0;

  let euclideanDistSum = [];

  Object.entries(dataset[p1]).forEach(([establishmentId, rate]) => {
    if (dataset[p2].hasOwnProperty(establishmentId))
      euclideanDistSum.push(Math.pow(rate - dataset[p2][establishmentId], 2));
  });

  return euclideanDistSum.length
    ? 1 /
        (1 + Math.sqrt(euclideanDistSum.reduce((acc, value) => acc + value, 0)))
    : 0;
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

const getEsblishmentsToRecommend = async (
  otherUserId,
  otherUserRatings,
  contentBasedRecommendations,
  usersRates,
  currentUserInfo
) => {
  const usersDistance = euclideanDistanceComparation(
    usersRates,
    currentUserInfo.id.toString(),
    otherUserId.toString()
  );

  if (usersDistance !== 0) {
    const estIds = [];

    await Object.entries(otherUserRatings).forEach(([estId, estRate]) => {
      if (
        contentBasedRecommendations.every(rec => rec.id.toString() !== estId) &&
        estRate >= 3
      ) {
        estIds.push(estId);
      }
    });

    const collaborativeFilteringRecommendations = (await getEstablishmentRecommendationsByIds(
      estIds,
      currentUserInfo
    )).map(rec => ({
      ...rec,
      basedOnUser: otherUserId,
      weight: rec.weight / (1 - usersDistance)
    }));

    return [...collaborativeFilteringRecommendations];
  }
  return [];
};

const getCollaborativeFilteringRecommendations = async (
  userInfo,
  contentBasedRecommendations
) => {
  const usersRates = await getUsersRates(userInfo.id);

  const recommendations = await Promise.all(
    Object.entries(usersRates)
      .filter(
        ([otherUserId]) => otherUserId.toString() !== userInfo.id.toString()
      )
      .map(([otherUserId, otherUserRatings]) =>
        getEsblishmentsToRecommend(
          otherUserId,
          otherUserRatings,
          contentBasedRecommendations,
          usersRates,
          userInfo
        )
      )
  );

  return recommendations.reduce((acc, array) => [...acc, ...array], []);
};

module.exports = {
  getCollaborativeFilteringRecommendations
};
