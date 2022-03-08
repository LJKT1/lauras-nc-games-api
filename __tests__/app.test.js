const request = require("supertest");
const db = require("../db/connection.js");
const app = require("../app");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET", () => {
  describe("GET /api ", () => {
    test("Status 200, responds with JSON describing all the available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then((result) => {
          expect(result.body).toMatchObject(endpoints);
        });
    });
    test("GET /api/no_such_endpoint returns status 404 and error message", () => {
      return request(app)
        .get("/api/no_such_endpoint")
        .expect(404)
        .then((result) => {
          expect(result.body.msg).toBe("Not Found");
        });
    });
  });

  describe("GET /api/categories", () => {
    test("Status 200, responds with array of category objects with slug and description properties", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then((result) => {
          expect(result.body.categories).toBeInstanceOf(Array);
          expect(result.body.categories).toHaveLength(4);
          result.body.categories.forEach((category) => {
            expect(category).toEqual(
              expect.objectContaining({
                slug: expect.any(String),
                description: expect.any(String),
              })
            );
          });
        });
    });
  });
  describe("GET /api/reviews", () => {
    test("Status 200, responds with array of review objects with correct properties", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toBeInstanceOf(Array);
          expect(result.body.reviews).toHaveLength(13);
          result.body.reviews.forEach((review) => {
            expect(review).toEqual(
              expect.objectContaining({
                owner: expect.any(String),
                title: expect.any(String),
                review_id: expect.any(Number),
                category: expect.any(String),
                review_img_url: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                comment_count: expect.any(String),
              })
            );
            expect(isNaN(Date.parse(review.created_at))).toBe(false);
          });
        });
    });
    test("Status 200, responds with array of objects sorted by date in descending order by default", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toBeSortedBy("created_at", {
            descending: true,
          });
          expect(result.body.reviews).not.toHaveLength(0);
        });
    });
    describe("GET /api/reviews accepts queries to sort_by, to order by and to filter by category", () => {
      test("Status 200, returns array of objects sorted by owner", () => {
        return request(app)
          .get("/api/reviews?sort_by=owner")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toBeSortedBy("owner", {
              descending: true,
            });
          });
      });
      test("Status 200, returns array of objects sorted by title", () => {
        return request(app)
          .get("/api/reviews?sort_by=title")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toBeSortedBy("title", {
              descending: true,
            });
          });
      });
      test("Status 200, returns array of objects sorted by comment_count", () => {
        return request(app)
          .get("/api/reviews?sort_by=comment_count")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toBeSortedBy("comment_count", {
              descending: true,
            });
          });
      });
      test("Status 200, returns array of objects in ascending order", () => {
        return request(app)
          .get("/api/reviews?sort_by=review_id&order=ASC")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toBeSortedBy("review_id", {
              ascending: true,
            });
          });
      });
      test("Status 200, returns array of objects in descending order", () => {
        return request(app)
          .get("/api/reviews?sort_by=votes&order=DESC")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toBeSortedBy("votes", {
              descending: true,
            });
          });
      });
      test("Status 200, returns array of objects filtered by category", () => {
        return request(app)
          .get("/api/reviews?category=dexterity")
          .expect(200)
          .then((result) => {
            result.body.reviews.forEach((review) => {
              expect(review.category).toBe("dexterity");
            });
          });
      });
      test("Status 200, returns empty array if category exists but there are no reviews", () => {
        return request(app)
          .get("/api/reviews?category=children's games")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toHaveLength(0);
          });
      });
      test("Status 200, returns array of objects in ascending order filtered by category ", () => {
        return request(app)
          .get("/api/reviews?sort_by=review_id&order=ASC&category=dexterity")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toBeSortedBy("review_id", {
              ascending: true,
            });
            result.body.reviews.forEach((review) => {
              expect(review.category).toBe("dexterity");
            });
          });
      });
      describe("GET /api/reviews error handling", () => {
        test("Status 400 and error message when passed bad request", () => {
          return request(app)
            .get("/api/reviews/bad_request")
            .expect(400)
            .then((result) => {
              expect(result.body.msg).toBe("Bad Request");
            });
        });
        test("Status 400 and error message when passed bad query", () => {
          return request(app)
            .get("/api/reviews?sort_by=bad_query")
            .expect(400)
            .then((result) => {
              expect(result.body.msg).toBe("Bad Request");
            });
        });
        test("Status 404 and error message when passed invalid category", () => {
          return request(app)
            .get("/api/reviews?category=no_such_category")
            .expect(404)
            .then((result) => {
              expect(result.body.msg).toBe("Not Found");
            });
        });
        test("Status 400 and error message when passed invalid order", () => {
          return request(app)
            .get("/api/reviews?sort_by=review_id&order=invalid")
            .expect(400)
            .then((result) => {
              expect(result.body.msg).toBe("Bad Request");
            });
        });
      });
    });
  });
  describe("GET /api/reviews/:review_id", () => {
    test("Status 200, responds with a single matching review", () => {
      return request(app)
        .get("/api/reviews/2")
        .expect(200)
        .then((result) => {
          expect(result.body.review).toEqual({
            owner: "philippaclaire9",
            title: "Jenga",
            review_id: 2,
            review_body: "Fiddly fun for all the family",
            designer: "Leslie Scott",
            review_img_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            category: "dexterity",
            created_at: "2021-01-18T10:01:41.251Z",
            votes: 5,
            comment_count: "3",
          });
        });
    });
    test("Status 404 and error message if nonexistent id", () => {
      return request(app)
        .get("/api/reviews/999999")
        .expect(404)
        .then((result) => {
          expect(result.body.msg).toBe("Not Found");
        });
    });
    test("Status 400 and error message if invalid id", () => {
      return request(app)
        .get("/api/reviews/invalid_id")
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Bad Request");
        });
    });
    describe("GET /api/reviews/:review_id/comments", () => {
      test("Status 200, responds with array of comments for given review_id, with correct properties", () => {
        return request(app)
          .get("/api/reviews/3/comments")
          .expect(200)
          .then((result) => {
            expect(result.body).toBeInstanceOf(Array);
            expect(result.body).toHaveLength(3);
            result.body.forEach((comment) => {
              expect(comment).toEqual(
                expect.objectContaining({
                  comment_id: expect.any(Number),
                  votes: expect.any(Number),
                  created_at: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                })
              );
              expect(isNaN(Date.parse(comment.created_at))).toBe(false);
            });
          });
      });
      test("Status 200, responds with empty array of comments when passed valid id which has no comments", () => {
        return request(app)
          .get("/api/reviews/4/comments")
          .expect(200)
          .then((result) => {
            expect(result.body).toBeInstanceOf(Array);
            expect(result.body).toHaveLength(0);
          });
      });
      test("Status 404 and error message if passed nonexistent id ", () => {
        return request(app)
          .get("/api/reviews/9999999/comments")
          .expect(404)
          .then((result) => {
            expect(result.body.msg).toBe("Not Found");
          });
      });
      test("Status 400 and error message if passed invalid id", () => {
        return request(app)
          .get("/api/reviews/invalid_id/comments")
          .expect(400)
          .then((result) => {
            expect(result.body.msg).toBe("Bad Request");
          });
      });
    });
  });
  describe("GET /api/users", () => {
    test("Status 200, responds with array of user objects with username property", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((result) => {
          expect(result.body.users).toBeInstanceOf(Array);
          expect(result.body.users).toHaveLength(4);
          result.body.users.forEach((user) => {
            expect(user).toEqual(
              expect.objectContaining({
                username: expect.any(String),
              })
            );
          });
        });
    });
  });
  describe("GET /api/users/:username", () => {
    test("Status 200, responds with user object with correct properties", () => {
      return request(app)
        .get("/api/users/philippaclaire9")
        .expect(200)
        .then((result) => {
          expect(result.body).toEqual({
            user: {
              username: "philippaclaire9",
              name: "philippa",
              avatar_url:
                "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
            },
          });
        });
    });
    test("Status 404 and error message if nonexistent username", () => {
      return request(app)
        .get("/api/users/nonexistent_username")
        .expect(404)
        .then((result) => {
          expect(result.body.msg).toBe("Not Found");
        });
    });
  });
});
describe("PATCH", () => {
  describe("PATCH /api/reviews/:review_id", () => {
    test("Status 200 with updated review object with increased votes", () => {
      const updateVotes = { inc_votes: 1 };
      return request(app)
        .patch("/api/reviews/2")
        .send(updateVotes)
        .expect(200)
        .then((result) => {
          expect(result.body.review).toEqual({
            owner: "philippaclaire9",
            title: "Jenga",
            review_id: 2,
            review_body: "Fiddly fun for all the family",
            designer: "Leslie Scott",
            review_img_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            category: "dexterity",
            created_at: "2021-01-18T10:01:41.251Z",
            votes: 6,
          });
        });
    });
    test("Status 200 with updated review object with decreased votes", () => {
      const updateVotes = { inc_votes: -4 };
      return request(app)
        .patch("/api/reviews/2")
        .send(updateVotes)
        .expect(200)
        .then((result) => {
          expect(result.body.review).toEqual({
            owner: "philippaclaire9",
            title: "Jenga",
            review_id: 2,
            review_body: "Fiddly fun for all the family",
            designer: "Leslie Scott",
            review_img_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            category: "dexterity",
            created_at: "2021-01-18T10:01:41.251Z",
            votes: 1,
          });
        });
    });
    test("Status 200 with updated review object if passed object has extra value", () => {
      const updateVotesObj = { inc_votes: 4, extra_property: "extra value" };
      return request(app)
        .patch("/api/reviews/2")
        .send(updateVotesObj)
        .expect(200)
        .then((result) => {
          expect(result.body.review).toEqual({
            owner: "philippaclaire9",
            title: "Jenga",
            review_id: 2,
            review_body: "Fiddly fun for all the family",
            designer: "Leslie Scott",
            review_img_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            category: "dexterity",
            created_at: "2021-01-18T10:01:41.251Z",
            votes: 9,
          });
        });
    });
    test("Status 200 responds with review when passed empty object", () => {
      const updateVotes = {};
      return request(app)
        .patch("/api/reviews/2")
        .send(updateVotes)
        .expect(200)
        .then((result) => {
          expect(result.body.review).toEqual({
            owner: "philippaclaire9",
            title: "Jenga",
            review_id: 2,
            review_body: "Fiddly fun for all the family",
            designer: "Leslie Scott",
            review_img_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            category: "dexterity",
            created_at: "2021-01-18T10:01:41.251Z",
            votes: 5,
          });
        });
    });
    test("Status 400 and error message when passed /api/reviews/bad_request", () => {
      const updateVotes = { inc_votes: 7 };
      return request(app)
        .patch("/api/reviews/bad_request")
        .send(updateVotes)
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Bad Request");
        });
    });
    test("Status 404 and error message when passed invalid request, eg /api/reviews/999999", () => {
      const updateVotes = { inc_votes: 7 };
      return request(app)
        .patch("/api/reviews/999999")
        .send(updateVotes)
        .expect(404)
        .then((result) => {
          expect(result.body.msg).toBe("Not Found");
        });
    });
    test("Status 400 and error message when passed bad value in object", () => {
      const updateVotesString = { inc_votes: "4 votes" };
      return request(app)
        .patch("/api/reviews/2")
        .send(updateVotesString)
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Bad Request");
        });
    });
  });
  describe("PATCH /api/comments/:comment_id", () => {
    test("Status 200 with updated comment object with increased votes", () => {
      const updateVotes = { inc_votes: 1 };
      return request(app)
        .patch("/api/comments/2")
        .send(updateVotes)
        .expect(200)
        .then((result) => {
          expect(result.body.comment).toEqual({
            comment_id: 2,
            author: "mallionaire",
            review_id: 3,
            votes: 14,
            created_at: "2021-01-18T10:09:05.410Z",
            body: "My dog loved this game too!",
          });
        });
    });
    test("Status 200 with updated comment object with decreased votes", () => {
      const updateVotes = { inc_votes: -10 };
      return request(app)
        .patch("/api/comments/2")
        .send(updateVotes)
        .expect(200)
        .then((result) => {
          expect(result.body.comment).toEqual({
            comment_id: 2,
            author: "mallionaire",
            review_id: 3,
            votes: 3,
            created_at: "2021-01-18T10:09:05.410Z",
            body: "My dog loved this game too!",
          });
        });
    });
    test("Status 200 with updated comment object if passed extra value", () => {
      const updateVotes = { inc_votes: 2, extra_property: "extra value" };
      return request(app)
        .patch("/api/comments/2")
        .send(updateVotes)
        .expect(200)
        .then((result) => {
          expect(result.body.comment).toEqual({
            comment_id: 2,
            author: "mallionaire",
            review_id: 3,
            votes: 15,
            created_at: "2021-01-18T10:09:05.410Z",
            body: "My dog loved this game too!",
          });
        });
    });
    test("Status 200 with updated comment object if passed empty object", () => {
      const updateVotes = {};
      return request(app)
        .patch("/api/comments/2")
        .send(updateVotes)
        .expect(200)
        .then((result) => {
          expect(result.body.comment).toEqual({
            comment_id: 2,
            author: "mallionaire",
            review_id: 3,
            votes: 13,
            created_at: "2021-01-18T10:09:05.410Z",
            body: "My dog loved this game too!",
          });
        });
    });
    test("Status 400 and error message when passed bad request", () => {
      const updateVotes = { inc_votes: 1 };
      return request(app)
        .patch("/api/comments/bad_request")
        .send(updateVotes)
        .expect(400)
        .then((result) => {
          expect(result.body).toEqual({ msg: "Bad Request" });
        });
    });
    test("Status 404 and error message when passed nonexistent id", () => {
      const updateVotes = { inc_votes: 1 };
      return request(app)
        .patch("/api/comments/999999")
        .send(updateVotes)
        .expect(404)
        .then((result) => {
          expect(result.body).toEqual({ msg: "Not Found" });
        });
    });
  });
});
describe("POST", () => {
  describe("POST /api/reviews/:review_id/comments", () => {
    test("Status 201, responds with comment newly added to database ", () => {
      const newComment = {
        username: "mallionaire",
        body: "Body of test comment to be newly added",
      };
      return request(app)
        .post("/api/reviews/2/comments")
        .send(newComment)
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toEqual({
            comment_id: expect.any(Number),
            author: "mallionaire",
            review_id: 2,
            votes: 0,
            created_at: expect.any(String),
            body: "Body of test comment to be newly added",
          });
          expect(isNaN(Date.parse(body.comment.created_at))).toBe(false);
        });
    });
    test("Status 201, responds with comment newly added, ignores superfluous properties ", () => {
      const newComment = {
        username: "mallionaire",
        body: "Wonderful game",
        extra_property: "Extra value",
      };
      return request(app)
        .post("/api/reviews/2/comments")
        .send(newComment)
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toEqual({
            comment_id: expect.any(Number),
            author: "mallionaire",
            review_id: 2,
            votes: 0,
            created_at: expect.any(String),
            body: "Wonderful game",
          });
          expect(isNaN(Date.parse(body.comment.created_at))).toBe(false);
        });
    });
    test("Status 400 and error message when passed invalid id", () => {
      const newComment = {
        username: "mallionaire",
        body: "Loads of fun",
      };
      return request(app)
        .post("/api/reviews/invalid_id/comments")
        .send(newComment)
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Bad Request");
        });
    });
    test("Status 404 and error message when passed nonexistent id ", () => {
      const newComment = {
        username: "mallionaire",
        body: "Amazing game",
      };
      return request(app)
        .post("/api/reviews/99999999/comments")
        .send(newComment)
        .expect(404)
        .then((result) => {
          expect(result.body.msg).toBe("Not Found");
        });
    });
    test("Status 400 and error message when missing username", () => {
      const newComment = {
        body: "A bit boring tbh",
      };
      return request(app)
        .post("/api/reviews/2/comments")
        .send(newComment)
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Bad Request");
        });
    });
    test("Status 400 and error message when missing body", () => {
      const newComment = {
        username: "mallionaire",
      };
      return request(app)
        .post("/api/reviews/2/comments")
        .send(newComment)
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Bad Request");
        });
    });
    test("Status 404 and error message when username doesn't exist", () => {
      const newComment = {
        username: "ziggy",
        body: "Great fun to be had by all",
      };
      return request(app)
        .post("/api/reviews/2/comments")
        .send(newComment)
        .expect(404)
        .then((result) => {
          expect(result.body.msg).toBe("Not Found");
        });
    });
  });
});
describe("DELETE", () => {
  describe("DELETE /api/comments/:comment_id", () => {
    test("Status 204 and no content", () => {
      return request(app)
        .delete("/api/comments/1")
        .expect(204)
        .then((result) => {
          expect(result.body).toEqual({});
        });
    });
    test("Status 404 and error message when passed nonexistent id", () => {
      return request(app)
        .delete("/api/comments/999999")
        .expect(404)
        .then((result) => {
          expect(result.body.msg).toBe("Not Found");
        });
    });
    test("Status 400 and error message when passed invalid id", () => {
      return request(app)
        .delete("/api/comments/invalid_id")
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Bad Request");
        });
    });
  });
});
