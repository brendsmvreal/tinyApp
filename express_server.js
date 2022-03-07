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

function generateRandomString() {
  let result = Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join("");
  return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
   };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: req.params.longURL, 
    username: req.cookies['username'] };
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
  const username = req.body["username"];
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const username = req.body["username"];
  res.clearCookie("username", username);
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




