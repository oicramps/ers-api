const { executeQuery } = require("../database/config");

const fetchByQuery = async query => {
  const { body } = await executeQuery(query);
  return body.results.bindings;
};

module.exports = fetchByQuery;
