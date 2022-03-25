const db = require("../models");
const { catchErrors } = require("../middleware/errors");
const { NotFoundError } = require("./errors/httpError");
const { fn, col, where } = require("sequelize");

const Character = db.characters;

const store = async (req, res) => {
  const character = await Character.create(req.body);
  res.status(201).json(character);
};

const index = async (req, res) => {
  const options = { attributes: ["id","name", "image"] };

  if (req.query.movies) {
    options.include = [
      {
        model: db.movies,
        as: "movies",
        through: { where: { movieId: req.query.movies } },
        required: true,
      },
    ];

    const { name, movies , ...query } = req.query;

    if (!name) {
      options.where = query;
    } else {
      options.where = {
        name: where(fn("lower", col("name")), "LIKE", "%" + name + "%"),
        ...query,
      };
    }
  } else {
    const { name, ...query } = req.query;

    if (!name) {
      options.where = query;
    } else {
      options.where = {
        name: where(fn("lower", col("name")), "LIKE", "%" + name + "%"),
        ...query,
      };
    }
  }

  const characters = await Character.findAll(options);
  res.json(characters);
};

const show = async (req, res) => {
  const character = await Character.findByPk(req.params.id, {
    include: "movies",
  });
  if (!character) throw new NotFoundError();
  res.json(character);
};

const update = async (req, res) => {
  const characterId = req.params.id;
  const { imagen, name, age, weight, story } = req.body;
  try {
    const character = await Character.findByPk(characterId);
    if (!character) return NotFoundError()
    await character.update({ imagen, name, age, weight, story });
    await character.save();
    res.status(200).json(character);
  } catch (err) {
    throw new NotFoundError();
  }
  
};

const destroy = async (req, res) => {
  const deletedRows = await Character.destroy({ where: { id: req.params.id } });
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
