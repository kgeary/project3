// Requiring bcrypt for password hashing. Using the bcryptjs version as the regular bcrypt module sometimes causes errors on Windows machines
var bcrypt = require("bcryptjs");
// Creating our User model
module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define("User", {
    // The email cannot be null, and must be a proper email before creation
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // The password cannot be null
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    img: {
      type: DataTypes.STRING,
      defaultValue: "https://via.placeholder.com/150"
    }

  });

  User.associate = (models) => {
    models.User.hasMany(models.Student, { foreignKey: "ParentId" }); // Kids <-> Parent
    models.User.hasMany(models.Course, {
      foreignKey: {
        name: "TeacherId",
        allowNull: true
      }
    }); // Teacher <-> Course
  };

  // Creating a custom method for our User model. This will check if an unhashed password entered by the user can be compared to the hashed password stored in our database
  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  User.addHook("beforeCreate", function (user) {
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
  });

  User.addHook("beforeUpdate", function (user) {
    // If the user is updating password hash it before saving
    if (user.password !== user._previousDataValues.password) {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });


  return User;
};
