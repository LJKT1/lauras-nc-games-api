const db = require("../db/connection");

exports.removeCommentsById = (id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id =$1 RETURNING *`, [id])
    .then((results) => {
      if (results.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
    });
};

exports.updateCommentVotes = (id, votes) => {
  const { inc_votes = 0 } = votes;
  return db
    .query(
      `UPDATE comments SET votes=votes+$1 WHERE comment_id=$2 RETURNING *;`,
      [inc_votes, id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return result.rows[0];
    });
};
