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


// db.query(
//   'SELECT * FROM `Animal` ',
//   function(err, results, fields) {
//     console.log(results, 'RESULT'); // results contains rows returned by server
//     console.log(fields, 'FIELDS'); // fields contains extra meta data about results, if available
//   }
// );

module.exports = mysqlConnection; 