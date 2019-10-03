const mongosse = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../../config/jwt");
const aesjs = require("aes-js");

const UserModel = mongosse.model("User");

let userController = {};

userController.newUser = (req, res) => {
  if (req.body.username && req.body.password && req.body.key) {
    const { username, email, password } = decryptData(req.body)

    UserModel.findOne({ username: username }).then(user => {
      if (user)
        res.json({
          success: false,
          message: "This username has no available"
        });
      else {
        bcrypt
          .hash(password, 10)
          .then(hash => {
            let encryptedPassword = hash;
            let newUser = new UserModel({
              username: username.toLowerCase(),
              password: encryptedPassword,
              email: email
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
  const { password, username } = decryptData(req.body);
  const query = [];

  if (username) query.push({ username: username.toLowerCase() });

  UserModel.findOne({ $or: query }).then(async user => {
    if (!user)
      res.json({
        success: false,
        message: "User not found",
        statusCode: 400
      });
    else {
      // const result = await user.authenticate(password);
      const result = bcrypt.compare(password, user.password);
      if (!result)
        res.json({
          success: false,
          message: "Wrong password",
          statusCode: 400
        });
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
        });
      }
    }
  });
};

decryptData = data => {
  const aesCtr = new aesjs.ModeOfOperation.ctr(data.key);
  const decryptedData = {};

  for (const [name, value] of Object.entries(data)) {
    if (name !== "key") {
      const encryptedBytes = aesjs.utils.hex.toBytes(value);
      const decryptedBytes = aesCtr.decrypt(encryptedBytes);
      decryptedData[name] = aesjs.utils.utf8.fromBytes(decryptedBytes);
    }
  }

  return { ...decryptedData }
};
module.exports = userController;
