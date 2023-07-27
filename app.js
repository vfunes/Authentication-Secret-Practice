require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to database.");
  })
  .catch((err) => {
    console.log("Not connected to database.");
    console.log(err);
  });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });
    const result = await newUser.save();
    if (result) {
      res.render("secrets");
    } else {
      console.log("Login Failed");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const foundName = await User.findOne({ email: username });
    if (foundName) {
      if (foundName.password === password) {
        res.render("secrets");
      } else {
        console.log("Password Does not Match...Try Again !");
      }
    } else {
      console.log("User Not found...");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
