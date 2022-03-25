const db = require("../models");
const { catchErrors } = require("../middleware/errors");
const { NotFoundError } = require("./errors/httpError");
const { fn, col, where } = require("sequelize");

const Movie = db.movies;

const store = async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json(movie);
};

const index = async (req, res) => {
  const genreId = req.query.genre;
  const title = req.query.title;
  const orderBy = req.query.order || "ASC";

  if (!genreId && !title) {
    let movies = await Movie.findAll({ order: [["creationDate", orderBy]] });
    return res.json(movies);
  } else {
    let movies;
    if (!genreId) {
      movies = await Movie.findAll({
        where: {
          title: where(fn("lower", col("title")), "LIKE", "%" + title + "%"),
        },
      });
      return res.json(movies);
    } else if (!title) {
      movies = await Movie.findAll(
        { where: { genreId } },
        { order: ["creationDate", orderBy] }
      );
      return res.json(movies);
    } else {
      movies = await Movie.findAll(
        {
          where: {
            title: where(fn("lower", col("title")), "LIKE", "%" + title + "%"),
            genreId,
          },
        },
        { order: ["creationDate", orderBy] }
      );
      return res.json(movies);
    }
  }
};

const show = async (req, res) => {
  const movie = await Movie.findByPk(req.params.id, {
    include: "characters",
  });
  if (!movie) throw new NotFoundError();
  res.json(movie);
};

const update = async (req, res) => {
  const movieId = req.params.id;
  const { imagen, title, creationDate, qualification, genreId } = req.body;

  try {
    const movie = await Movie.findByPk(movieId);
    if (!genreId) {
      await movie.update({ imagen, title, creationDate, qualification });
      await movie.save();
    } else {
      await movie.update({
        imagen,
        title,
        creationDate,
        qualification,
        genreId,
      });
      await movie.save();
    }

    res.status(200).json(movie);
  } catch (e) {
    throw new NotFoundError();
  }
};

const destroy = async (req, res) => {
  const deletedRows = await Movie.destroy({ where: { id: req.params.id } });
  if (deletedRows === 0) throw new NotFoundError();
  res.status(204).json(null);
};

module.exports = {
  store: catchErrors(store),
  index: catchErrors(index),
  show: catchErrors(show),
  update: catchErrors(update),
  destroy: catchErrors(destroy),
};
