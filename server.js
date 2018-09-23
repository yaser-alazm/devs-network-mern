const express = require("express"); // Module to deal with routes
const mongoose = require("mongoose"); // to deal with MongoDB
const bodyParser = require("body-parser"); //Module to get the response from json with res.body
const passport = require("passport"); //Module for routes authentications have different strategies ( local - google - jsonWebToken ) used for public and private routes

const path = require("path"); // Path module to deal with linking front end React with backend NodeJs ( basically this module use to set paths and directories)
const users = require("./routers/api/users");
const profile = require("./routers/api/profile");
const posts = require("./routers/api/posts");

const app = express();

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//DB configs
const db = require("./config/keys").mongoURI;

//MongoDB connect
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//Passport middleware
app.use(passport.initialize());

//Passport config
require("./config/passport")(passport);

//Use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server Running On Port ${port}`));
