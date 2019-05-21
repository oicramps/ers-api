const groupBy = (array, key) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];

    delete obj[key];

    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat({
      ...obj
    });
    return objectsByKeyValue;
  }, {});

module.exports = { groupBy };
