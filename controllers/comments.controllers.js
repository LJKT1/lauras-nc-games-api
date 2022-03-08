const {
  removeCommentsById,
  updateCommentVotes,
} = require("../models/comments.models");

exports.deleteCommentsById = (req, res, next) => {
  const id = req.params.comment_id;
  return removeCommentsById(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentVotes = (req, res, next) => {
  const id = req.params.comment_id;
  const votes = req.body;
  updateCommentVotes(id, votes)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
