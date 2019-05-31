const { getUsersRatesQuery } = require("../database/queries");
const {
  getEstablishmentRecommendationsByIds
} = require("./contentBasedRecommendationController");
const { mapOwlResult } = require("../utils/owlMapper");
const fetchByQuery = require("./databaseController");
var usersRates = require("../database/rates.json");

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
    rate: usersRates[rec.user_id][rec.est_id]
  }));

  const groupedRates = mappedRates.reduce((acc, obj) => {
    acc[obj.user_id] = { ...acc[obj.user_id], [obj.est_id]: obj.rate };

    return acc;
  }, {});

  return groupedRates;
};

const mapRecommendation = (recommendation, userId, usersDistance) => ({
  ...recommendation,
  basedOn: [
    ...(recommendation.basedOn || []),
    { userId, similarity: usersDistance * 100 }
  ],
  weight: recommendation.weight * 1.5
});

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
    let collaborativeFilteringRecommendations = [];

    await Object.entries(otherUserRatings).forEach(([estId, estRate]) => {
      if (estRate >= 3) {
        const index = contentBasedRecommendations.findIndex(
          rec => rec.id.toString() === estId.toString()
        );

        if (index !== -1) {
          collaborativeFilteringRecommendations.push(
            mapRecommendation(
              contentBasedRecommendations[index],
              otherUserId,
              usersDistance
            )
          );
          contentBasedRecommendations.splice(index, 1);
        } else {
          estIds.push(estId);
        }
      }
    });

    collaborativeFilteringRecommendations = [
      ...collaborativeFilteringRecommendations,
      ...(await getEstablishmentRecommendationsByIds(
        estIds,
        currentUserInfo
      )).map(rec => mapRecommendation(rec, otherUserId, usersDistance))
    ];

    return [...collaborativeFilteringRecommendations];
  }
  return [];
};

const getCollaborativeFilteringRecommendations = async (
  userInfo,
  contentBasedRecommendations
) => {
  const usersRates = await getUsersRates(userInfo.id);

  const collaborativeRecommendations = await Promise.all(
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

  const uniqueCollaborativeRecommendations = [];

  collaborativeRecommendations
    .reduce((acc, array) => [...acc, ...array], [])
    .forEach(rec => {
      const index = uniqueCollaborativeRecommendations.findIndex(
        uRec => uRec.id.toString() === rec.id.toString()
      );

      const uRec = uniqueCollaborativeRecommendations[index];

      if (index !== -1) {
        rec.basedOn = [...rec.basedOn, ...uRec.basedOn];
        rec.weight = (rec.weight + uRec.weight) / 2;
        uniqueCollaborativeRecommendations.splice(index, 1, rec);
      } else uniqueCollaborativeRecommendations.push(rec);
    });

  return uniqueCollaborativeRecommendations;
};

module.exports = {
  getCollaborativeFilteringRecommendations
};
