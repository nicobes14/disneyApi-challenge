"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);

const db = {};

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
  define: { timestamps: false },
  logging: false,
});

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.fillGenresTable = () => {
  db.genre.count().then((numberOfGenres) => {
    if (numberOfGenres === 0) {
      db.genre.bulkCreate(db.genre.data).then("List of genres created");
    }
  });
};

module.exports = db;
