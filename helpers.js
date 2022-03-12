const bcrypt = require('bcryptjs');

const generateRandomString = function() {
  let result = Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join("");
  return result;
};

const findUserByEmail = function(email, users) {  // helper function used in authenticateUser function
  for (const userID in users) {
    if (users[userID].email === email) {
      return true;
    }
  }
};

const findUserByPassword = function(password, users) {  // helper function used in authenticateUser function
  for (const userID in users) {
    if (bcrypt.compareSync(password, users[userID].password)) {
      return true;
    }
  }
  return false;
};

const authenticateUser = function(email, password, users) {  // helper function used in POST /login
  for (const user in users) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      return users[user]; 
    }
  }
  const userFound = findUserByEmail(email, users);
  const passwordFound = findUserByPassword(password, users);
  if (!userFound && !passwordFound) {
    return false;
  }
  if (userFound || passwordFound) {
    return true;
  }
  return true;
};

const urlsForUser = function(id, uDb) { // helper function that gives access to the user of their created URL's 
  newObj = {};
  for (const k in uDb) {
    if (id === uDb[k].userID) {
      newObj[k] = {
        longURL: uDb[k].longURL,
        userID: uDb[k].userID
      };
    }
  }
  return newObj;
};

const findUserByShortURL = function(shortURL, id, uDb) {
  if (uDb[shortURL].userID === id) {
    return true;
  }
  return false;
};

module.exports = { generateRandomString, authenticateUser, urlsForUser, findUserByShortURL, findUserByEmail };