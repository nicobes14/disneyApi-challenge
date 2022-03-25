"use strict";

const { movies, characters } = require("../../models/");

module.exports = {
  async up(queryInterface, Sequelize) {
    
    let movieWithAssociations = await movies.create({
      title: "La primera pelicula de fantasia",
      image: "imagePATH",
      creationDate: new Date(2012, 1, 1),
      qualification: 2,
      genreId: 2,
    });

    let user = await characters.create({
      name: "Ramon",
      image: "imagePATH",
      age: 48,
      weight: 85,
      story: "La historia de Ramon",
    });

    await movieWithAssociations.addCharacters(user);

    return Promise.all([
      movies.create({
        title: "La primera pelicula de terror",
        image: "imagePATH",
        creationDate: new Date(2001, 1, 1),
        qualification: 5,
        genreId: 1,
      }),
      movies.create({
        title: "La segunda pelicula de terror",
        image: "imagePATH",
        creationDate: new Date(2005, 1, 1),
        qualification: 4,
        genreId: 1,
      }),
      movies.create({
        title: "La primera pelicula de comedia",
        image: "imagePATH",
        creationDate: new Date(2009, 1, 1),
        qualification: 3,
        genreId: 3,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("movies", null, {});
  },
};
