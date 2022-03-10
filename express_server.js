const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const req = require("express/lib/request");

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

// const findUserByPassword = function(password, users) {  // helper function used in authenticateUser function
//   for (const userID in users) {
//     if (users[userID].password === password) {
//       return true;
//     }
//   }
//   return false;
// };

// const findUserByEmail = function(email, users) {  // helper function used in authenticateUser function
//   for (const userID in users) {
//     if (users[userID].email === email) {
//       return users[userID];
//       // return true;
//     }
//   }
//   return false;
// };

// const authenticateUser = function(email, password, users) {  // helper function used in POST /login
//   const userFound = findUserByEmail(email, users);
//   console.log("userFound", userFound);
//   const passwordFound = findUserByPassword(password, users);
//   console.log("passwordFound", passwordFound);
//   if (!userFound && !passwordFound) {
//     return false;
//   }
//   if (userFound && passwordFound) {
//     return userFound;
//   }
//   // return true;
// };

const findUserByEmail = function(email, users) {  // helper function used in authenticateUser function
  for (const userID in users) {
    if (users[userID].email === email) {
      return true;
    }
  }
  return false;
};

const findUserByPassword = function(password, users) {  // helper function used in authenticateUser function
  for (const userID in users) {
    if (users[userID].password === password) {
      return true;
    }
  }
  return false;
};
const authenticateUser = function(email, password, users) {  // helper function used in POST /login
  for (const user in users) {
    if(users[user].email === email && users[user].password === password) {
        return users[user]; // this is for the login 
    }
  }
  const userFound = findUserByEmail(email, users);
  const passwordFound = findUserByPassword(password, users);
  if (!userFound && !passwordFound) {
    return false;
  }
  if (userFound || passwordFound) {
    return true
  }
  return true
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    urls: urlDatabase,
    userKey: user
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    urls: urlDatabase,
    userKey: user
   };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: req.params.longURL, 
    userKey: user 
  };
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
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    userKey: user,
  };
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    userKey: user
  };
  res.render("urls_login", templateVars)
})

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
  const {email, password} = req.body 
  let user = authenticateUser(email, password, users);
  if (user.email) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid credentials!");
  }
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("Invalid credentials!")
  }
  const authUser = authenticateUser(email, password, users);
  if (authUser) {
    return res.status(400).send("Invalid credentials!")
  }
  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email,
    password
  }
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // const user = req.body["user"];
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




