const express = require("express");
const {
  getReviews,
  getReviewById,
  patchReviewVotes,
  getCommentsByReviewId,
  postCommentsByReviewId,
} = require("../controllers/reviews.controllers");

const reviewsRouter = express.Router();

reviewsRouter.route("/").get(getReviews);

reviewsRouter.route("/:review_id").get(getReviewById).patch(patchReviewVotes);

reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postCommentsByReviewId);

module.exports = reviewsRouter;
