const axios = require("axios");
const moment = require("moment");
const { hereApiUrl, hereAppId, hereAppCode } = require("../config/environment");

const periodConstants = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  NIGHT: "night",
  DAWN: "dawn"
};

const getCurrentWeather = async ({ latitude, longitude }) => {
  const { data: weather } = await axios.get(hereApiUrl, {
    params: {
      product: "observation",
      app_id: hereAppId,
      app_code: hereAppCode,
      latitude,
      longitude
    }
  });

  return !!weather.observations.location[0].observation[0].precipitationDesc;
};

const compareTimeBetween = (time, initialTime, finalTime) =>
  moment(time, "HH:mm").isBetween(
    moment(initialTime, "HH:mm"),
    moment(finalTime, "HH:mm")
  );

const getWorkPeriodByTime = time => {
  if (compareTimeBetween(time, "06:00", "11:59")) {
    return periodConstants.MORNING;
  } else if (compareTimeBetween(time, "12:00", "18:59")) {
    return periodConstants.AFTERNOON;
  } else if (compareTimeBetween(time, "19:00", "23:59")) {
    return periodConstants.NIGHT;
  } else {
    return periodConstants.DAWN;
  }
};

const filterRecommendationsByContext = async (userInfo, recommendations) => {
  const isRaining = await getCurrentWeather(userInfo);

  const filterByDistance = rec =>
    !userInfo.radius || rec.distance <= userInfo.radius;

  const filterByWeather = rec => !isRaining || JSON.parse(rec.hasIndoorPlace);

  const filterByTime = rec =>
    rec.workPeriod.includes(
      getWorkPeriodByTime(moment(userInfo.currentTime).format("HH:mm"))
    );

  return recommendations
    .filter(filterByDistance)
    .filter(filterByWeather)
    .filter(filterByTime);
};

module.exports = { filterRecommendationsByContext };
