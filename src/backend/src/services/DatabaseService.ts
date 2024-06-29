import mysql2 from "mysql2";
import mysql2promise from "mysql2/promise";

const param = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 4000,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  namedPlaceholders: true,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
  connectionLimit: 1, // Setting connectionLimit to "1" in a serverless function environment optimizes resource usage, reduces costs, ensures connection stability, and enables seamless scalability.
  maxIdle: 1, // max idle connections, the default value is the same as `connectionLimit`
  enableKeepAlive: true,
};

export const pool = mysql2.createPool(param);

export const connectToDatabase = async () => {
  const connection = await mysql2promise.createConnection(param);
  console.log('Connected to the database');
  return connection;
};

export default pool;
