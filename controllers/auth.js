const passport = require("passport");
const validator = require("validator");
const session = require("express-session");

//const bcrypt = require("bcrypt");

const User = require("../models/User");

module.exports = {
getLogin: (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
  });
},

postLogin: async (req, res, next) => {
  const validationErrors = [];
  //const email = req.body.email;
  //const password = req.body.password;
  // const existingUser = await User.findOne({ email }); //* check if the user with the entered email already exists in the database
  // const isPasswordCorrect = await bcrypt.compare(
  //   password,
  //   existingUser.password
  // );
  // if (!isPasswordCorrect) {
  //   validationErrors.push({ msg: "invalid credentials" });
  // }
  if (!validator.isEmail(req.body.email)) {
    validationErrors.push({ msg: "Enter valid Email" });
  }
  if (validator.isEmpty(req.body.password)) {
    validationErrors.push({ msg: "Enter valid Email" });
  }
  if (validationErrors.length > 0) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "you are logged in." });
      res.redirect(req.session.returnTo || "/profile");
    });
  })(req, res, next);
},

logout: (req, res) => {
  req.logout(() => {
    console.log("User logged out");
  });
  req.session.destroy((err) => {
    if (err) {
      console.log("Error : Failed to destroy the session during logout.", err);
    }
    req.user = null;
    res.redirect("/");
  });
},

getSignup: (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("signup", {
    title: "Create Account",
  });
},

postSignup: async (req, res, next) => {
  const validationErrors = [];
  //const password = req.body.password;
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  //const hashedPassword = await bcrypt.hash(password, (saltOrRounds = 10)); //* hashes the password with a salt, generated with the specified number of rounds
  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password
  });
  User.findOne(
    { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect("../signup");
      }
      user.save((err) => {
        if (err) {
          return next(err);
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/profile");
        });
      });
    }
  );
}
}

