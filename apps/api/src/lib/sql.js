const postgres = require("postgres");

// #region Connection

const sql = postgres({
  host: process.env.RAVE_PG_HOST,
  port: process.env.RAVE_PG_PORT,

  database: process.env.RAVE_PG_DATABASE,

  username: process.env.RAVE_PG_USERNAME,
  password: process.env.RAVE_PG_PASSWORD,

  onnotice: () => {},
  transform: postgres.camel,
});

module.exports = sql;

// #endregion
