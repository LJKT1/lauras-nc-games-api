const express = require("express");
const {
  deleteCommentsById,
  patchCommentVotes,
} = require("../controllers/comments.controllers");

const commentsRouter = express.Router();

commentsRouter
  .route("/:comment_id")
  .patch(patchCommentVotes)
  .delete(deleteCommentsById);

module.exports = commentsRouter;
