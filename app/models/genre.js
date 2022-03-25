"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class genre extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      genre.hasMany(models.movies, { as: "movies" });
    }
  }
  genre.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      image: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "genre",
    }
  );

  genre.data = [
    { name: "Comedy", image: "/images/genres/comedy.png" },
    { name: "Fantasy", image: "/images/genres/fantasy.png" },
    { name: "Crime", image: "/images/genres/crime.png" },
    { name: "Drama", image: "/images/genres/drama.png" },
    { name: "Music", image: "/images/genres/music.png" },
    { name: "Adventure", image: "/images/genres/sdventure.png" },
    { name: "History", image: "/images/genres/history.png" },
    { name: "Thriller", image: "/images/genres/thriller.png" },
    { name: "Animation", image: "/images/genres/animation.png" },
    { name: "Family", image: "/images/genres/family.png" },
    { name: "Mystery", image: "/images/genres/mystery.png" },
    { name: "Biography", image: "/images/genres/biography.png" },
    { name: "Action", image: "/images/genres/action.png" },
    { name: "Film-Noir", image: "/images/genres/film-noir.png" },
    { name: "Romance", image: "/images/genres/romance.png" },
    { name: "Sci-Fi", image: "/images/genres/sci-fi.png" },
    { name: "War", image: "/images/genres/war.png" },
    { name: "Western", image: "/images/genres/western.png" },
    { name: "Horror", image: "/images/genres/horror.png" },
    { name: "Musical", image: "/images/genres/musical.png" },
    { name: "Sport", image: "/images/genres/sport.png" },
  ];

  return genre;
};
