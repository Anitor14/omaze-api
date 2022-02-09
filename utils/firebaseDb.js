// const firebase = require('firebase');
const firebase = require('firebase-admin');

const { FIREBASE_CONFIG } = require("./app");
const db = firebase.initializeApp(FIREBASE_CONFIG);

module.exports = db;