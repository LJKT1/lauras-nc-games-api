const db = require("../db/connection");

exports.selectUsers = () => {
  return db.query(`SELECT username FROM users`).then((results) => {
    return results.rows;
  });
};

exports.selectUserByUsername = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username=$1`, [username])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return result.rows[0];
    });
};
