const getUserRecommendationsQuery = userId => {
  return `
      SELECT DISTINCT ?name ?overall ?rating ?checkins ?priceRange ?latitude ?longitude WHERE {
        ?user ers:id "${userId}"^^xsd:long .
        ?user rdf:type ?types .
        ?types rdfs:subClassOf ers:Recommendations.
        ?establishments rdf:type ?types.

        FILTER (?types NOT IN (ers:Recommendations)) .
        FILTER EXISTS {?establishments rdf:type ers:Establishment}.
        ?establishments ers:name ?name .
        ?establishments ers:latitude ?latitude .
        ?establishments ers:longitude ?longitude .
        ?establishments ers:overallRating ?overall .
        ?establishments ers:ratingCount ?rating .
        ?establishments ers:checkins ?checkins .
        ?establishments ers:priceRange ?priceRange
    }
  `;
};

const getUsersRatesQuery = userId => {
  return `
    SELECT DISTINCT ?user_id ?est_id WHERE {
        ?user rdf:type ers:User .
        ?user ers:id ?user_id .
        ?user ers:rated ?rates .
        ?rates ers:id ?est_id .
    }
    
    ORDER BY ?name ?estName DESC(?name)
  `;
};

module.exports = { getUserRecommendationsQuery, getUsersRatesQuery };
