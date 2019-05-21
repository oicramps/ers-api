const mapOwlResult = rec => {
  return Object.entries(rec)
    .map(([key, value]) => ({
      [key]: value.value
    }))
    .reduce((obj, item) => {
      const [key, value] = Object.entries(item)[0];
      obj[key] = value;
      return obj;
    }, {});
};

module.exports = { mapOwlResult };
