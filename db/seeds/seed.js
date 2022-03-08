const format = require("pg-format");
const db = require("../connection");

const seed = (data) => {
  const { categoryData, commentData, reviewData, userData } = data;
  return db
    .query(`DROP TABLE IF EXISTS comments;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS reviews;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS categories;`);
    })
    .then(() => {
      return db.query(`CREATE TABLE categories (
        slug VARCHAR(255) PRIMARY KEY,
        description TEXT
      )`);
    })
    .then(() => {
      return db.query(`CREATE TABLE users (
        username VARCHAR(255) PRIMARY KEY,
        avatar_url VARCHAR(1000),
        name VARCHAR(255) NOT NULL
      )`);
    })
    .then(() => {
      return db.query(`CREATE TABLE reviews (
        review_id SERIAL PRIMARY KEY,
        title VARCHAR(2000) NOT NULL,
        review_body TEXT NOT NULL,
        designer VARCHAR(255) NOT NULL,
        review_img_url VARCHAR(1000),
        votes INT DEFAULT 0,
        category VARCHAR(255) REFERENCES categories(slug),
        owner VARCHAR(255) REFERENCES users(username),
        created_at TIMESTAMP DEFAULT NOW()
      )`);
    })
    .then(() => {
      return db.query(`CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        author VARCHAR(255) REFERENCES users(username),
        review_id INT REFERENCES reviews(review_id),
        votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        body TEXT NOT NULL
      )`);
    })
    .then(() => {
      const sql = format(
        `INSERT INTO categories
        (slug, description)
        VALUES %L
        RETURNING *;`,
        categoryData.map((category) => [category.slug, category.description])
      );
      return db.query(sql);
    })
    .then(() => {
      const sql = format(
        `INSERT INTO users
        (username, avatar_url, name)
        VALUES %L
        RETURNING *;`,
        userData.map((user) => [user.username, user.avatar_url, user.name])
      );
      return db.query(sql);
    })
    .then(() => {
      const sql = format(
        `INSERT INTO reviews
        (title, review_body, designer, review_img_url, votes, category, owner, created_at )
        VALUES %L
        RETURNING *;`,
        reviewData.map(
          ({
            title,
            review_body,
            designer,
            review_img_url = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
            votes,
            category,
            owner,
            created_at,
          }) => [
            title,
            review_body,
            designer,
            review_img_url,
            votes,
            category,
            owner,
            created_at,
          ]
        )
      );
      return db.query(sql);
    })
    .then(() => {
      const sql = format(
        `INSERT INTO comments
      (author, review_id, votes, created_at, body)
      VALUES %L
      RETURNING *;`,
        commentData.map((comment) => [
          comment.author,
          comment.review_id,
          comment.votes,
          comment.created_at,
          comment.body,
        ])
      );
      return db.query(sql);
    });
};

module.exports = seed;
