const { generateRandomString, authenticateUser, urlsForUser, findUserByShortURL } = require('./helpers.js');

const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret_key'],
}));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk")
  }
};

// GET requests

app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    userKey: user,
  };
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const urls = urlsForUser(user_id, urlDatabase);
  let templateVars = {
    urls,
    userKey: user
  };

  if (user_id) {
    res.render("urls_index", templateVars);
  } else {
    templateVars = {
      urls: null,
      userKey: null
    };
    res.render("urls_main_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    urls: urlDatabase,
    userKey: user
  };
  if (user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const shortURL = req.params.shortURL;
  if (findUserByShortURL(shortURL, user_id, urlDatabase)) { 
    const templateVars = {
      shortURL,
      longURL: urlDatabase[req.params.shortURL],
      userKey: user
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("Invalid credentials!");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (urlDatabase[shortURL]) {
    res.redirect(longURL.longURL);
  } else {
    res.send("Invalid input!");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    userKey: user,
  };
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    userKey: user
  };
  res.render("urls_login", templateVars);
});

// POST requests
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = {
    longURL: req.body.longURL,
    userID: user_id
  };
  if (user_id) {
    res.redirect(`/urls/${randomURL}`);
  } else {
    res.send("Not logged in!");
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  if (findUserByShortURL(id, user_id, urlDatabase)) {
    const newLongURL = req.body.newLongURL;
    const id = req.params.id;
    urlDatabase[id].longURL = newLongURL;
    res.redirect("/urls/");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  if (findUserByShortURL(shortURL, user_id, urlDatabase)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else {
    res.send("Cannot delete without login!");
  }
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  let user = authenticateUser(email, password, users);
  if (user.email) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid credentials!");
  }
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("Invalid credentials!");
  }
  const authUser = authenticateUser(email, password, users);
  if (authUser) {
    return res.status(400).send("Invalid credentials!");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email,
    password: hashedPassword,
  };
  req.session.user_id = newUserID;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});