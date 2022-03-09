const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  let result = Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join("");
  return result;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies['user_id']
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies['user_id']
   };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: req.params.longURL, 
    user: req.cookies['user_id'] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]
  if (urlDatabase[shortURL]) {
    res.redirect(longURL);
  } else { 
 res.send("Invalid input!")
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: null,
    // username: null,
  };
  res.render('urls_register', templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);
});

app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.newLongURL;
  const id = req.params.id;
  urlDatabase[id] = newLongURL; 
  res.redirect("/urls")
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {  
  const user = req.body["user"];
  for (const element in users) {
    if (users[element].email === user) {
      res.cookie("user_id", users[element]) 
    }
  }
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body["email"];
  const password = req.body["password"];
  // 1) create object that will append to users
  users[id] = {
    "id": id, 
    "email": email, 
    "password": password
  }
  // 2) add this object to users
  // 3) store this object into res.cookie("username": newObject)
  res.cookie("user_id", users[id])
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const user = req.body["user"];
  res.clearCookie("user_id", user);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




