const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookies = require("cookie-parser")

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookies())
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

const generateRandomString = () => {

  let string = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklomnopqrstuvwxyz1234567890";
  let charsLength = chars.length;

  for (let i = 0; i < 6; i++) {
    string += chars.charAt(Math.floor(Math.random() * charsLength));
  }

  return string;
};

const generateRandomNumber = () => {

  let cookie = "";
  let nums = "0123456789";
  let numLength = nums.length;

  for (let i = 0; i < 12; i++) {
    cookie += nums.charAt(Math.floor(Math.random() * numLength));
  }
  return cookie;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies.username}
  res.render("urls_register", templateVars)
})

app.get("/urls", (req, res) => {
  console.log(req.cookies)
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies.username}
  console.log(templateVars.username)
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  // console.log(req.body)
  const username = req.body["username"];
  const id = generateRandomNumber();
  res.cookie("username", username)
  res.cookie("id", id)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.clearCookie("id")
  res.redirect("/urls")
})

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const longURL = req.body['longURL'];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const newURL = req.body["longURL"];
  // console.log(req.params)
  urlDatabase[req.params.id] = newURL;
  res.redirect("/urls");
});

