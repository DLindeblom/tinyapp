const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookies());
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

const users = {
  id: {
    id: ["randomID"],
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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { user: users[user_id] };
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
  res.redirect("/urls"), console.log(users);
  return;
});



app.get("/urls", (req, res) => {
  // console.log(req.cookies)
  const user_id = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { user: users[user_id] };
  // console.log(templateVars.user);
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { user: users[user_id] };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // console.log(users)

  for (let user in users) {
    if (email === users[user].email) {
      // console.log(users[user])
      if (password === users[user].password) {
        const id = users[user].id;
        // console.log(user)
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
  const user_id = req.cookies["user_id"];
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL, user: users[user_id] };
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

