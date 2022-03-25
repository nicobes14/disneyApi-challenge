"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class characters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      characters.belongsToMany(models.movies, {
        through: "charactermovies",
        as: "movies",
        foreignKey: "characterId",
      });
    }
  }
  characters.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          return process.env.SCHEME_AND_HOST + this.getDataValue('image')
        },
      },
      age: { type: DataTypes.INTEGER, allowNull: false },
      weight: { type: DataTypes.INTEGER, allowNull: false },
      story: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "characters",
    }
  );
  return characters;
};
