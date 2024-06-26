import mysql2 from "mysql2";
import mysql2promise from "mysql2/promise";

export const pool = mysql2.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  namedPlaceholders: true,
});

export const connectToDatabase = async () => {
  const connection = await mysql2promise.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    namedPlaceholders: true,
  });
  console.log('Connected to the database');
  return connection;
};

export default pool;
