const dotEnv = require("dotenv");

dotEnv.config();

module.exports = {
  port: process.env.PORT,
  stardogUrl: process.env.STARDOG_URL,
  stardogUser: process.env.STARDOG_USER,
  stardogPassword: process.env.STARDOG_PASSWORD,
  stardogDbName: process.env.STARDOG_DATABASE,
  hereApiUrl: process.env.HERE_API_URL,
  hereAppId: process.env.HERE_APP_ID,
  hereAppCode: process.env.HERE_APP_CODE
};
