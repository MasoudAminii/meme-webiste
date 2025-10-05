// src/data/users.js
// Dev sample users. In production you should store users in a DB and keep hashed passwords.
const users = [
  { id: 1, username: "admin", password: "password123", role: "admin" },
  { id: 2, username: "masoud", password: "masoud123", role: "user" },
  { id: 3, username: "guest", password: "guestpass", role: "guest" },
];

export const getUserByUsername = (username) => {
  return users.find((u) => u.username === username);
};
