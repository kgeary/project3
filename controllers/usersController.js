const db = require("../models");

function getUser(user) {
  if (!user.username) {
    return undefined;
  }

  const newUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
  };
  return newUser;
}

// Defining methods for the usersController
module.exports = {
  create: function (req, res) {
    db.User.create(req.body)
      .then(dbModel => {
        console.log(dbModel);
        res.json(getUser(dbModel));
      })
      .catch(err => {
        console.log("ERROR ADDING USER");
        console.log(err);
        if (err.code === 11000) {
          res.status(409).json(err);
        } else {
          res.status(422).json(err);
        }
      });
  },

  login: function (req, res) {
    res.json(getUser(req.user));
  },

  logout: function (req, res) {
    if (!req.user) {
      res.json({ message: "No users logged in out" });
    }
    console.log("Logging Out User");
    const username = req.user.username;
    req.logout();
    res.json({ message: `${username} logged out` });
  },

  read: function (req, res) {
    if (req.user) {
      res.json(getUser(req.user));
    } else {
      res.json();
    }
  },
};