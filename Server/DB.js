const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql1234'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL server!');

  connection.query("CREATE DATABASE IF NOT EXISTS cn_lab2", function(err, data){
            if (err) throw err;
        });

  connection.query('USE cn_lab2', (err, result) => {
    if (err) throw err;
    console.log('Db selected!');
  });

  let sql = `CREATE TABLE IF NOT EXISTS video_table(
                id int primary key auto_increment,
                video_id varchar(255) not null,
                video_path varchar(255) not null
                )`;
    
        connection.query(sql, function(err, results, fields) {
            if (err) throw err;
            console.log("Table created");
    });
});

module.exports = connection;