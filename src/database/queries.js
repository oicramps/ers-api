const getFormattedLong = long => `"${long}"^^xsd:long`;

const getUserRecommendationsQuery = userId => {
  return `
      SELECT DISTINCT ?id ?name ?overall ?rating ?checkins ?likes ?priceRange ?latitude ?longitude ?workPeriod WHERE {
        ?user ers:id ${getFormattedLong(userId)} .
        ?user rdf:type ?types .
        ?types rdfs:subClassOf ers:Recommendations.
        ?establishment rdf:type ?types.

        FILTER (?types NOT IN (ers:Recommendations)) .
        FILTER EXISTS {?establishment rdf:type ers:Establishment}.
        ?establishment ers:id ?id .
        ?establishment ers:name ?name .
        ?establishment ers:latitude ?latitude .
        ?establishment ers:longitude ?longitude .
        ?establishment ers:overallRating ?overall .
        ?establishment ers:ratingCount ?rating .
        ?establishment ers:checkins ?checkins .
        ?establishment ers:priceRange ?priceRange .
        ?establishment ers:engagementCount ?likes .
        ?establishment ers:workPeriod ?workPeriod .
    }
  `;
};

const getUsersRatesQuery = () => {
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

const getUserCheckinsQuery = userId => {
  return ` 
    SELECT DISTINCT ?id  WHERE {
        ?user ers:id ${getFormattedLong(userId)} .
        ?establishment rdf:type ?types.
        ?user ers:hasCheckedIn ?checkedInEstablishment .
        ?checkedInEstablishment ers:id ?id
    }
  `;
};

const getEstablishmentsByIds = ids => {
  return `
    SELECT DISTINCT ?id ?name ?overall ?rating ?likes ?checkins ?priceRange ?latitude ?longitude ?workPeriod WHERE {
      
      ?establishment ers:id ?id .

      FILTER (?id IN (${ids.map(getFormattedLong).join(", ")})) .

      ?establishment ers:name ?name .
      ?establishment ers:latitude ?latitude .
      ?establishment ers:longitude ?longitude .
      ?establishment ers:overallRating ?overall .
      ?establishment ers:ratingCount ?rating .
      ?establishment ers:checkins ?checkins .
      ?establishment ers:priceRange ?priceRange .
      ?establishment ers:engagementCount ?likes . 
      ?establishment ers:workPeriod ?workPeriod .
  }`;
};

module.exports = {
  getUserRecommendationsQuery,
  getUsersRatesQuery,
  getUserCheckinsQuery,
  getEstablishmentsByIds
};
