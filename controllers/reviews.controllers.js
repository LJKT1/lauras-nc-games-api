const {
  selectReviews,
  selectReviewById,
  selectCommentsByReviewId,
  insertCommentsByReviewId,
  updateReviewVotes,
} = require("../models/reviews.models");

exports.getReviews = (req, res, next) => {
  const { sort_by, order, category } = req.query;
  selectReviews(sort_by, order, category)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getReviewById = (req, res, next) => {
  const id = parseInt(req.params.review_id);
  selectReviewById(id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByReviewId = (req, res, next) => {
  const id = parseInt(req.params.review_id);
  selectCommentsByReviewId(id)
    .then((comments) => {
      res.status(200).send(comments);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentsByReviewId = (req, res, next) => {
  const id = parseInt(req.params.review_id);
  insertCommentsByReviewId(id, req.body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchReviewVotes = (req, res, next) => {
  const id = req.params.review_id;
  updateReviewVotes(id, req.body)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};
