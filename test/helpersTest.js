const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const userExists = true;
    assert.strictEqual(userExists, user);
  });
  
  it('it should return undefined if user doesn\'t exists', function() {
    const user = findUserByEmail("brenda@123.com", testUsers);
    assert.isUndefined(user);
  });
});