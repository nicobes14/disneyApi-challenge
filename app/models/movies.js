"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class movies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      movies.belongsTo(models.genre, { as: "genre", foreignKey: "genreId" });
      movies.belongsToMany(models.characters, {
        through: "charactermovies",
        as: "characters",
        foreignKey: "movieId",
      });
    }
  }
  movies.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          return process.env.SCHEME_AND_HOST + this.getDataValue('image')
        },
      },
      creationDate: { type: DataTypes.DATE, allowNull: false },
      qualification: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "movies",
    }
  );
  return movies;
};
