import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // agar password hai to yaha likho
  database: "scholarship_db",
});