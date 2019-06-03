const { Connection, query } = require("stardog");
const {
  stardogUrl,
  stardogUser,
  stardogPassword,
  stardogDbName
} = require("../config/environment");

const connection = new Connection({
  username: stardogUser,
  password: stardogPassword,
  endpoint: stardogUrl
});

const executeQuery = sparqlQuery =>
  query.execute(
    connection,
    stardogDbName,
    sparqlQuery,
    "application/sparql-results+json",
    {
      limit: 200,
      offset: 0,
      reasoning: true
    }
  );

module.exports = { connection, executeQuery };
