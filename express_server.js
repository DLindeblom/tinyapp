const express = require('express');
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const getUserByEmail = require("./helpers")

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookies());
app.use(cookieSession({
  name: 'session',
  keys: ["I ate lasagna for dinner and had lots of garlic bread and ceaser salad too"]
}));




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

const urlsForUser = (userID) => {

  const urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

// const getUserByEmail = (email, database) => {

//   for (let user in database) {
//     console.log(user);
//     if (email === database[user].email) {
//       // console.log(email)
//       console.log(database[user].email);
//       return database[user];
//     }
//   }
// };


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const { userID } = req.session;
  const templateVars = { user: users[userID] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const randomID = generateUserId();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (password === "" || email === "") {
    res.status(400).send("Please fill out all required fields.");
    return;
  }

  const user = getUserByEmail(email, users);
  if (!user) {

    users[randomID] = {
      id: randomID,
      email: email,
      password: hashedPassword
    };

    req.session.userID = randomID;
    res.redirect("/urls");
    return;
  }

  res.status(400).send("That email already exists. Please sign in, or create an account with another email address.");
  return;

});

app.get("/urls", (req, res) => {
  const { userID } = req.session;
  if (!userID) {
    return res.redirect("/error");
  }
  const urls = urlsForUser(userID);

  const templateVars = {
    urls,
    user: users[userID]
  };

  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const { userID } = req.session;
  const templateVars = { user: users[userID] };

  if (!userID) {
    res.redirect("/error");
    return;
  }

  return res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const { userID } = req.session;
  const templateVars = { user: users[userID] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);
  if (user) {

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(403).send("403 = Incorrect Password");
      

    } else {
      req.session.userID = user.id;
      res.redirect("/urls");
      return
    }
  }

  res.status(403).send("403 - Oops! Please check that you have typed a valid email address. If you don't have an account, register and then login.");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const { userID } = req.session;
  if (!userID) {
    return res.status(403).send("403 Forbidden - You do not have permission to access this site. Please login.\n");
  }

  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send(" 400 - You need to enter a valid longURL");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const { userID } = req.session;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = { shortURL: req.params.shortURL, longURL, user: users[userID] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const { userID } = req.session;
  if (!userID) {
    return res.status(401).send("401 Unauthorized - You do not have permission to access this site. Please login.\n");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const { userID } = req.session;
  if (!userID) {
    return res.status(401).send("401 Unauthorized = You do not have permission to access this site. Please login.\n");
  }

  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send("400 - You need to enter a valid longURL");
  }

  const { shortURL } = req.params;
  const urlBelongsToUser = urlDatabase[shortURL].userID === userID;
  if (!urlBelongsToUser) {
    return res.status(403).send("403 - You do not have permission to edit this URL.");
  }

  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/error", (req, res) => {
  const { userID } = req.session;
  const templateVars = { user: users[userID] };

  res.render("urls_error", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});



