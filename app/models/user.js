"use strict";

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    setPassword(password) {
      this.salt = crypto.randomBytes(16).toString("hex");
      this.hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
        .toString("hex");
    }

    verifyPassword(password) {
      const hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
        .toString("hex");
      return this.hash === hash;
    }

    generateJwt() {
      return jwt.sign(
        { id: this.id, email: this.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
    }

    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
      },
      name: DataTypes.STRING(100),
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      salt: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
