const mongosse = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../../config/jwt");

const UserModel = mongosse.model("User");

let userController = {};

userController.newUser = (req, res) => {
  if (req.body.username && req.body.password) {
    UserModel.findOne({ username: req.body.username }).then(user => {
      if (user)
        res.json({
          success: false,
          message: "This username has no available"
        });
      else {
        bcrypt
          .hash(req.body.password, 10)
          .then(hash => {
            let encryptedPassword = hash;
            let newUser = new UserModel({
              username: req.body.username,
              password: encryptedPassword,
              email: req.body.email,
            });

            newUser
              .save()
              .then(() =>
                res.json({
                  success: true,
                  message: "User created with success",
                  statusCode: 201
                })
              )
              .catch(err =>
                res.json({
                  success: false,
                  message: err,
                  statusCode: 500
                })
              );
          })
          .catch(err => ({
            success: false,
            message: "Password doesn't match",
            statusCode: 400
          }));
      }
    });
  } else
    res.json({
      success: false,
      message: "Username and password fields are required",
      statusCode: 400
    });
};

userController.signIn = (req, res) => {
  const { password, username } = req.body;
  const query = [];

  if (username) query.push({ username: username.toLowerCase() })

  UserModel.findOne({ $or: query })
    .then(async user => {
      if (!user) res.json({
        success: false,
        message: "User not found",
        statusCode: 400
      })
      else {
        // const result = await user.authenticate(password);
        const result = bcrypt.compare(password, user.password)
        if (!result) res.json({
          success: false,
          message: "Wrong password",
          statusCode: 400
        })
        else {
          const token = jwt.sign({ user }, jwtConfig.secret);
          res.json({
            success: true,
            data: {
              user: {
                id: user._id,
                username: user.username,
                email: user.email
              },
              token
            },
            statusCode: 200
          })
        }
      }
    })
}

module.exports = userController;
