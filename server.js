const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const { ensureAuth, ensureGuest } = require("./middleware/auth");
const bodyParser = require("body-parser");
//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

const PORT = process.env.PORT;

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

//using EJS for views
app.set("view engine", "ejs");

//static folders
app.use(express.static("pubic"));

//Body parsing
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

//logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: true },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//passport middlewares
//app.use(express.session({ secret: "SECRET" }));
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());


// app.use(passport.authenticate("session"));

//Setup Routes
app.use("/", mainRoutes);
app.use("/post", ensureAuth, postRoutes);
app.use("/comment", commentRoutes);

app.listen(PORT, () => {
  console.log("server is running at port= ", PORT);
});
