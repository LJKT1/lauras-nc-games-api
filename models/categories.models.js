const db = require("../db/connection");

exports.selectCategories = () => {
  return db.query(`SELECT * from categories;`).then((results) => {
    return results.rows;
  });
};
