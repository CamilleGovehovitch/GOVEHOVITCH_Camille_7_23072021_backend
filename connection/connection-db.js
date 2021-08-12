const mysql = require('mysql2');
const dotEnv = require('dotenv').config();


const mysqlConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DB,
});

mysqlConnection.connect((err) => {
  if(!err) {
    console.log('Connected');
  } else {
    console.log('Not Connected');
  }
});

module.exports = mysqlConnection; 