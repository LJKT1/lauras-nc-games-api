const db = require("../db/connection");

exports.selectReviews = (
  sortBy = "created_at",
  order = "DESC",
  category = null
) => {
  const validSortBy = [
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "comment_count",
  ];

  const validOrder = ["ASC", "DESC", "asc", "desc"];

  const validCategories = [null];

  return db
    .query(`SELECT slug FROM categories`)
    .then((results) => {
      results.rows.forEach((category) => {
        validCategories.push(category.slug);
      });
    })
    .then(() => {
      if (!validSortBy.includes(sortBy) || !validOrder.includes(order)) {
        return Promise.reject({ status: 400, msg: "Bad Request" });
      }
      if (!validCategories.includes(category)) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      let queryStr = `SELECT owner, title, review_id, category, review_img_url, reviews.created_at, reviews.votes, COUNT(comment_id) as "comment_count" 
      FROM reviews  
      LEFT JOIN comments  using (review_id)`;
      const queryValues = [];

      if (category) {
        queryStr += ` WHERE category = $1`;
        queryValues.push(category);
      }

      queryStr += ` GROUP BY owner, title, review_id, category, review_img_url, reviews.created_at, reviews.votes`;
      queryStr += ` ORDER BY ${sortBy} ${order}`;

      return db.query(queryStr, queryValues).then((results) => {
        return results.rows;
      });
    });
};

exports.selectReviewById = (id) => {
  if (isNaN(id)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  const validIds = [];
  return db
    .query(`SELECT review_id FROM reviews`)
    .then((results) => {
      results.rows.forEach((review) => {
        validIds.push(review.review_id);
      });
    })
    .then(() => {
      if (!validIds.includes(id)) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
    })
    .then(() => {
      return db
        .query(
          `SELECT owner, title, review_id, review_body, designer, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comment_id) as "comment_count" 
  FROM reviews  
  LEFT JOIN comments  using (review_id)
  WHERE review_id=$1
  GROUP BY owner, title, review_id, review_body, designer, review_img_url, category, reviews.created_at, reviews.votes;`,
          [id]
        )
        .then((result) => {
          return result.rows[0];
        });
    });
};

exports.selectCommentsByReviewId = (id) => {
  if (isNaN(id)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  const validIds = [];
  return db
    .query(`SELECT review_id FROM reviews`)
    .then((results) => {
      results.rows.forEach((review) => {
        validIds.push(review.review_id);
      });
    })
    .then(() => {
      if (!validIds.includes(id)) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
    })
    .then(() => {
      return db
        .query(`SELECT * from comments WHERE review_id=$1`, [id])
        .then((results) => {
          return results.rows;
        });
    });
};

exports.insertCommentsByReviewId = (id, newComment) => {
  const { username, body } = newComment;
  if (isNaN(id) || !username || !body) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  return db
    .query(
      `INSERT INTO comments (author, review_id, body) VALUES ($1, $2, $3)
  RETURNING *;`,
      [username, id, body]
    )
    .then((results) => {
      return results.rows[0];
    });
};

exports.updateReviewVotes = (id, votes) => {
  const { inc_votes = 0 } = votes;
  if (isNaN(id)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  return db
    .query(
      `UPDATE reviews SET votes= votes+$1 WHERE review_id=$2 RETURNING *;`,
      [inc_votes, id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return result.rows[0];
    });
};
