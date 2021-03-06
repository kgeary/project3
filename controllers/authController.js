const db = require("../models");
const sgMail = require("@sendgrid/mail");

// Generate a random password
function generateRandomPw() {
  const pwChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const length = Math.floor(Math.random() * 5) + 6;
  let pw = [];
  for (let i = 0; i < length; i++) {
    pw.push(pwChars[Math.floor(Math.random() * pwChars.length)]);
  }
  return pw.join("");
}

// Send an email
function sendEmail(to, from, subject, body) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: to,
    from: from,
    subject: subject,
    html: body,
  };
  (async () => {
    try {
      await sgMail.send(msg);
    } catch (err) {
      console.error(err.toString());
    }
  })();

}
module.exports = {

  create: function (req, res) {
    console.log("CREATE ACCOUNT");
    db.Code.findOne({ where: { code: req.body.code } }).then((data) => {

      if (!data) {
        throw new Error("Invalid Code");
      }

      // Valid Code Proceed
      db.User.create({
        email: req.body.email.trim().toLowerCase(),
        password: req.body.password,
        name: req.body.name,
        phone: req.body.phone.trim(),
      }).then(dbModel => {
        console.log(dbModel);
        req.login(dbModel, function (err) {
          if (!err) {
            res.json(dbModel);
          } else {
            //handle error
            console.log("SIGNUP LOGIN ERR", err);
            res.status(422).json(err);
          }
        });
      })
        .catch(err => {
          console.log("ERROR ADDING USER");
          console.log(err);
          res.status(422).json(err);
        });
    }).catch(() => {
      // Group Code not found - Do not create user
      res.status(401).json({ message: "Invalid Group Code" });
    });
  },

  login: function (req, res) {
    res.json(req.user);
  },

  getCurrentUser: function (req, res) {
    if (req.user) {
      db.User.findOne({ where: { id: req.user.id } })
        .then(data => {
          res.json(data);
        })
        .catch(err => {
          console.log("ERROR GETTING CURRENT USER", err);
          res.status(422).json("Error retrieving user");
        });
    } else {
      res.status(401).json({ message: "Not Authorized" });
    }
  },

  resetPassword: function (req, res) {
    if (req.body && req.body.email) {
      console.log("RESET PW FOR EMAIL", req.body.email);
      const tempPassword = generateRandomPw();
      db.User.findOne({ where: { email: req.body.email.toLowerCase() } })
        .then(dbUser => {
          dbUser.password = tempPassword;
          return dbUser.save({ individualHooks: true });
        })
        .then(() => {
          const body = `Your temporary password is: ${tempPassword}.  If you are still having issues, please visit RosterRocket.com`;
          console.log("TEMP PW", body);
          sendEmail(req.body.email, "no-reply@roster.rocket.com", "RosterRocket: Your new password", body);
          res.json();
        })
        .catch(err => {
          res.status(422).json(err);
        });
    } else {
      res.status(422).json("Email not provided");
    }
  },

  invite: function (req, res) {
    try {
      sendEmail(
        req.body.email,
        "no-reply@roster.rocket.com",
        "Invitation Signup for Roster Rocket",
        "Signup at: https://roster-rocket.herokuapp.com/signup with Group Code: " + req.body.code || "123456"
      );

      res.json({ messsage: "" });
    } catch (err) {
      res.status(422).json("Unable to send email");
    }

  },
};