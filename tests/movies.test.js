const request = require("supertest");
const { app, server } = require("../app/server");
const db = require("../app/models");

const User = db.User;
const Character = db.characters;
const Movie = db.movies;
const Genre = db.genre;
const basePath = "/movies";

const dummyMovies = [
  {
    title: "The Lion King",
    creationDate: new Date(1994, 6, 8).toISOString(),
    qualification: 5,
    image: "/images/the-lion-king.png",
    genreId: 1,
  },
  {
    title: "101 Dalmatians",
    creationDate: new Date(1961, 0, 25).toISOString(),
    qualification: 4,
    image: "/images/101-dalmatians.png",
    genreId: 2,
  },
];

const dummyCharacter = {
  name: "Jane",
  age: 33,
  weight: 88.5,
  story: "Jane story",
  image: "/images/jane.png",
};

describe("movies", () => {
  let authToken;

  beforeAll((done) => {
    User.destroy({ truncate: true }).then(() => {
      request(app)
        .post("/auth/register")
        .send({
          email: "foo@email.com",
          password: "foofoo",
          confirmPassword: "foofoo",
        })
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.token).toBeDefined();
          authToken = res.body.token;
          done();
        });
    });
  });

  beforeEach((done) => {
    Movie.destroy({ truncate: { cascade: true } }).then(() => done());
  });

  afterAll(() => {
    server.close();
  });

  // Create new movie
  describe(`POST ${basePath}`, () => {
    test("If the token is valid and the data is valid, the movie is created", (done) => {
      const [dummyMovie] = dummyMovies;

      request(app)
        .post(basePath)
        .set("Authorization", `Bearer ${authToken}`)
        .field("title", dummyMovie.title)
        .field("creationDate", dummyMovie.creationDate)
        .field("qualification", dummyMovie.qualification)
        .field("image", __dirname + "/resources/movies/the-lion-king.jpg")
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.title).toBe(dummyMovie.title);
          expect(res.body.creationDate).toBe(dummyMovie.creationDate);
          expect(parseInt(res.body.qualification)).toBe(
            dummyMovie.qualification
          );
          expect(res.body.image.includes("the-lion-king.jpg")).toBeTruthy();
          expect(res.body.image.includes("http")).toBeTruthy();

          Movie.findByPk(res.body.id)
            .then((movie) => {
              expect(movie).toBeInstanceOf(Movie);
              expect(movie.title).toBe(dummyMovie.title);
              expect(movie.creationDate.toISOString()).toBe(
                dummyMovie.creationDate
              );
              expect(movie.qualification).toBe(dummyMovie.qualification);
              expect(movie.image.includes("the-lion-king.jpg")).toBeTruthy();
              done();
            })
            .catch((err) => {
              done(err);
            });
        });
    });

    test("A movie with incomplete data will not be created", (done) => {
      request(app)
        .post(basePath)
        .send({
          title: "Aladdin",
          rating: 4,
        })
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(res.body).toBeInstanceOf(Array);
          done();
        });
    });
  });

  // Read list of movies
  describe("GET /movies", () => {
    test("There are movies, return an array", (done) => {
      Movie.bulkCreate(dummyMovies)
        .then((movies) => {
          const [movieInDB] = movies;
          request(app)
            .get(basePath)
            .set("Authorization", `Bearer ${authToken}`)
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Array);
              expect(res.body).toHaveLength(2);

              const [, movie] = res.body;
              expect(Object.keys(movie)).toHaveLength(6);
              expect(movie.id).toBe(movieInDB.id);
              expect(movie.title).toBe(movieInDB.title);
              expect(movie.creationDate).toBe(
                movieInDB.creationDate.toISOString()
              );
              expect(movie.image).toBe(movieInDB.image);
              done();
            });
        })
        .catch((err) => done(err));
    });

    test("Filter movies by title", (done) => {
      Movie.bulkCreate(dummyMovies)
        .then((movies) => {
          const [movieInDB] = movies;
          request(app)
            .get(`${basePath}?title=${movieInDB.title}`)
            .set("Authorization", `Bearer ${authToken}`)
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Array);
              expect(res.body).toHaveLength(1);

              const [movie] = res.body;
              expect(movie.id).toBe(movieInDB.id);
              expect(movie.title).toBe(movieInDB.title);
              expect(movie.creationDate).toBe(
                movieInDB.creationDate.toISOString()
              );
              expect(movie.image).toBe(movieInDB.image);
              done();
            });
        })
        .catch((err) => done(err));
    });

    test("Sort movies in descending order", (done) => {
      Movie.bulkCreate(dummyMovies)
        .then((movies) => {
          const [movieInDB] = movies;
          request(app)
            .get(`${basePath}?order=DESC`)
            .set("Authorization", `Bearer ${authToken}`)
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Array);
              expect(res.body).toHaveLength(2);

              const [movie] = res.body;
              expect(movie.id).toBe(movieInDB.id);
              expect(movie.title).toBe(movieInDB.title);
              expect(movie.creationDate).toBe(
                movieInDB.creationDate.toISOString()
              );
              expect(movie.image).toBe(movieInDB.image);
              done();
            });
        })
        .catch((err) => done(err));
    });

    test("Sort movies in ascending order", (done) => {
      Movie.bulkCreate(dummyMovies)
        .then((movies) => {
          const [movieInDB] = movies;
          request(app)
            .get(`${basePath}?order=ASC`)
            .set("Authorization", `Bearer ${authToken}`)
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Array);
              expect(res.body).toHaveLength(2);

              const [, movie] = res.body;
              expect(movie.id).toBe(movieInDB.id);
              expect(movie.title).toBe(movieInDB.title);
              expect(movie.creationDate).toBe(
                movieInDB.creationDate.toISOString()
              );
              expect(movie.image).toBe(movieInDB.image);
              done();
            });
        })
        .catch((err) => done(err));
    });

    test("Filter movies by genre id", (done) => {
      Movie.bulkCreate(dummyMovies)
        .then((movies) => {
          const [movieInDB] = movies;
          request(app)
            .get(`${basePath}?genre=${movieInDB.genreId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Array);

              const [movie] = res.body;
              expect(movie.id).toBe(movieInDB.id);
              expect(movie.title).toBe(movieInDB.title);
              expect(movie.creationDate).toBe(
                movieInDB.creationDate.toISOString()
              );
              expect(movie.image).toBe(movieInDB.image);

              expect(movie.genreId).toBe(movieInDB.genreId);

              done();
            });
        })
        .catch((err) => done(err));
    });

    test("There are no movies, return empty array", (done) => {
      request(app)
        .get(basePath)
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          done();
        });
    });
  });

  // Read a specific movie
  describe("GET /movies/:id", () => {
    test("Movie exist, return movie", (done) => {
      const [dummyMovie] = dummyMovies;

      Movie.create(dummyMovie)
        .then((movie) => {
          Character.create(dummyCharacter)
            .then((characterInDB) => {
              movie
                .addCharacter(characterInDB)
                .then(() => {
                  request(app)
                    .get(`${basePath}/${movie.id}`)
                    .set("Authorization", `Bearer ${authToken}`)
                    .end((err, res) => {
                      expect(res.status).toBe(200);
                      expect(res.body.title).toBe(movie.title);
                      expect(res.body.creationDate).toBe(
                        movie.creationDate.toISOString()
                      );
                      expect(res.body.rating).toBe(movie.rating);
                      expect(res.body.image.includes(movie.image)).toBeTruthy();
                      expect(res.body.image.includes("http")).toBeTruthy();
                      expect(res.body.characters).toBeInstanceOf(Array);
                      expect(res.body.characters).toHaveLength(1);

                      const [character] = res.body.characters;
                      expect(character.name).toBe(characterInDB.name);
                      expect(character.age).toBe(characterInDB.age);
                      expect(character.weight).toBe(characterInDB.weight);
                      expect(character.story).toBe(characterInDB.story);
                      expect(character.image).toBe(characterInDB.image);
                      done();
                    });
                })
                .catch((err) => done(err));
            })
            .catch((err) => done(err));
        })
        .catch((err) => done(err));
    });

    test("Movie does not exist, return status 404", (done) => {
      request(app)
        .get(`${basePath}/123`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(404);
          expect(res.body.message.includes("not found")).toBeTruthy();
          done();
        });
    });
  });

  // Update a specific movie
  describe("PUT /movies/:id", () => {
    test("Movie exist, update movie", (done) => {
      const [dummyMovie] = dummyMovies;

      Movie.create(dummyMovie)
        .then((movie) => {
          request(app)
            .put(`${basePath}/${movie.id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .field("title", "King")
            .field("image", __dirname + "/resources/movies/the-lion-king.jpg")
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.title).toBe("King");
              expect(res.body.creationDate).toBe(
                movie.creationDate.toISOString()
              );
              expect(parseInt(res.body.qualification)).toBe(
                movie.qualification
              );
              expect(res.body.image.includes("the-lion-king")).toBeTruthy();
              expect(res.body.image.includes("http")).toBeTruthy();
              done();
            });
        })
        .catch((err) => done(err));
    });

    test("Movie does not exist, return status 404", (done) => {
      request(app)
        .put(`${basePath}/123`)
        .set("Authorization", `Bearer ${authToken}`)
        .field("title", "King")
        .end((err, res) => {
          expect(res.status).toBe(404);
          expect(res.body.message.includes("not found")).toBeTruthy();
          done();
        });
    });
  });

  // Delete a specific movie
  describe("DELETE /movies/:id", () => {
    test("If the movie exists, delete it", (done) => {
      const [dummyMovie] = dummyMovies;

      Movie.create(dummyMovie)
        .then((movie) => {
          request(app)
            .delete(`${basePath}/${movie.id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .end((err, res) => {
              expect(res.status).toBe(204);
              expect(res.body).toEqual({});

              Movie.findByPk(movie.id)
                .then((movie) => {
                  expect(movie).toBeNull();
                  done();
                })
                .catch((err) => done(err));
            });
        })
        .catch((err) => done(err));
    });

    test("If the movie does not exist, return status 404", (done) => {
      request(app)
        .delete(`${basePath}/123`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(404);
          expect(res.body.message.includes("not found")).toBeTruthy();
          done();
        });
    });
  });
});
