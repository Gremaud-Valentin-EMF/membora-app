require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  max: 10, // équivalent à connectionLimit
  idleTimeoutMillis: 30000, // temps avant fermeture auto
});

module.exports = pool;
