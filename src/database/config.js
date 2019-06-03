const { Connection, query } = require("stardog");

const connection = new Connection({
  username: "admin",
  password: "admin",
  endpoint: "http://localhost:5820"
});

const executeQuery = sparqlQuery =>
  query.execute(
    connection,
    "ERS-KD",
    sparqlQuery,
    "application/sparql-results+json",
    {
      limit: 100,
      offset: 0,
      reasoning: true
    }
  );

module.exports = { connection, executeQuery };
