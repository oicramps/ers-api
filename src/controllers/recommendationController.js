const { query } = require("stardog");
const express = require("express");
const stardogConn = require("../database");

const router = express.Router();

const getUserRecommendationsQuery = userInfo => {
  return `
        SELECT DISTINCT ?name ?overall ?latitude ?longitude WHERE {
        ?user ers:id "${userInfo.id}"^^xsd:long .
        ?user rdf:type ?types .
        ?types rdfs:subClassOf ers:Recommendations.
        ?establishments rdf:type ?types.

        FILTER (?types NOT IN (ers:Recommendations)) .
        FILTER EXISTS {?establishments rdf:type ers:Establishment}.
        ?establishments ers:name ?name .
        ?establishments ers:latitude ?latitude .
        ?establishments ers:longitude ?longitude .
        ?establishments ers:overallRating ?overall .
    }`;
};

const getContentBasedRecommendations = async () => {
  return query.execute(
    stardogConn,
    "ERS",
    getUserRecommendationsQuery({ id: 701020243312004 }),
    "application/sparql-results+json",
    {
      limit: 10,
      offset: 0,
      reasoning: true
    }
  );
};

router.post("/", async (req, res) => {
  const { body } = await getContentBasedRecommendations();
  return res.send(body.results.bindings);
});

module.exports = app => app.use("/recommendation", router);
