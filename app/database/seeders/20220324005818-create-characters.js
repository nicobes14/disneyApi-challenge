"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    let characters = [];

    await queryInterface.bulkInsert(
      "characters",
      [
        {
          name: "Nicolas",
          image: "imagePATH",
          age: 23,
          weight: 66,
          story: "La historia de nicolas",
        },
        {
          name: "Petete",
          image: "imagePATH",
          age: 32,
          weight: 80,
          story: "La historia de Petete",
        },
        {
          name: "Sebastian",
          image: "imagePATH",
          age: 15,
          weight: 68,
          story: "La historia de Sebastian",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("characters", null, {});
  },
};
