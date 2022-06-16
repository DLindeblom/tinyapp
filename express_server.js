const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookies());
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: ""
  },
  "9sm5xK": {
    longURL: "http://google.com",
    userID: ""
  }
};

const users = {
  id: {
    id: "randomID",
    email: "email",
    password: "password"
  }
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

const generateUserId = () => {

  let string = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklomnopqrstuvwxyz1234567890";
  let charsLength = chars.length;

  for (let i = 0; i < 10; i++) {
    string += chars.charAt(Math.floor(Math.random() * charsLength));
  }

  return string;
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

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const randomID = generateUserId();
  const email = req.body.email;
  const password = req.body.password;

  if (password === "" || email === "") {
    res.status(400).send("Please fill out all required fields.");
    return;
  }

  for (let user in users) {
    if (email === users[user].email) {
      res.status(400).send("That email already exists. Please sign in, or create an account with another email address.");

      return;
    }
  }
  users[randomID] = {
    id: randomID,
    email: email,
    password: password
  };
  res.cookie("user_id", users[randomID].id),
    res.redirect("/urls");
  return;
});



app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    <a>Please Login</a>
    return res.redirect("/login");
  }

  const urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      urls[url] = urlDatabase[url];
    }
  }
  // console.log(urls)
  const templateVars = {
    urls,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] };

  if (!userID) {
    res.redirect("/login");
    return;
  }

  return res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (let user in users) {
    if (email === users[user].email) {

      if (password === users[user].password) {
        const id = users[user].id;
        res.cookie("user_id", id);
        res.redirect("/urls");
        return;

      } else {
        res.status(403).send("Incorrect Password.");
        return;
      }
    }
  }
  res.status(403).send("That email does not match our records.");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.status(403).send("403 Forbidden - You do not have permission to access this site. Please login.\n");
  }

  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send("You need to enter a valid longURL")
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };

  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = { shortURL: req.params.shortURL, longURL, user: users[userID] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.status(401).send("401 Unauthorized = You do not have permission to access this site. Please login.\n");
  }

  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send("You need to enter a valid longURL")
  }
  
  const { shortURL } = req.params
  const urlBelongsToUser = urlDatabase[shortURL].userID === userID
  if (!urlBelongsToUser) {
    return res.status(403).send("You do not have permission to edit this URL.")
  }

  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});

