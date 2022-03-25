const Joi = require("joi");

const movieSchema = Joi.object({
  title: Joi.string().required(),
  creationDate: Joi.date().required(),
  qualification: Joi.number().min(1).max(5).required(),
  image: Joi.string().required(),
  genreId: Joi.number(),
});

const validateMovie = (req, res, next) => {
  const result = movieSchema.validate(req.body, {
    abortEarly: false,
  });

  if (!result.error) {
    next();
  } else {
    const errors = result.error.details.map((err) => ({
      message: err.message,
    }));
    res.status(400).json(errors);
  }
};

module.exports = {
  validateMovie,
};
