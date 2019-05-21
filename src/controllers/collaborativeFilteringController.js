const getObjectLength = obj => Object.keys(obj).length;

const pearsonCorrelationComparation = (dataset, p1, p2) => {
  const bothExisists = {};

  for (item in dataset[p1]) {
    if (item in dataset[p2]) {
      bothExisists[item] = 1;
    }
  }
  var num_existence = getObjectLength(bothExisists);
  if (num_existence == 0) return 0;
  var p1_sum = 0,
    p2_sum = 0,
    p1_sq_sum = 0,
    p2_sq_sum = 0,
    prod_p1p2 = 0;

  for (var item in bothExisists) {
    p1_sum += dataset[p1][item];
    p2_sum += dataset[p2][item];
    p1_sq_sum += Math.pow(dataset[p1][item], 2);
    p2_sq_sum += Math.pow(dataset[p2][item], 2);
    prod_p1p2 += dataset[p1][item] * dataset[p2][item];
  }
  var numerator = prod_p1p2 - (p1_sum * p2_sum) / num_existence;
  var st1 = p1_sq_sum - Math.pow(p1_sum, 2) / num_existence;
  var st2 = p2_sq_sum - Math.pow(p2_sum, 2) / num_existence;
  var denominator = Math.sqrt(st1 * st2);
  if (denominator == 0) return 0;
  else {
    var val = numerator / denominator;
    return val;
  }
};

const euclideanDistanceComparation = (dataset, p1, p2) => {
  if (![p1, p2].every(item => dataset[item])) return 0;

  let euclideanDistSum = [];

  for (item in dataset[p1]) {
    if (item in dataset[p2]) {
      euclideanDistSum.push(Math.pow(dataset[p1][item] - dataset[p2][item], 2));
    }

    const sum = euclideanDistSum.reduce((acc, value) => acc + value, 0);

    return 1 / (1 + Math.sqrt(sum));
  }
};

module.exports = {
  pearsonCorrelationComparation,
  euclideanDistanceComparation
};
