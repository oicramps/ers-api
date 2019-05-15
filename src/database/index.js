const { Connection } = require("stardog");

const conn = new Connection({
  username: "admin",
  password: "admin",
  endpoint: "http://localhost:5820"
});

module.exports = conn;
