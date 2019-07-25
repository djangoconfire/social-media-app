const functions = require('firebase-functions');
const app = require('express')();

const { getAllScreams, postScream } = require('./handlers/screams');
const { signup, login } = require('./handlers/users');
const FirebaseAuthMiddleware = require('./util/fbAuth');

// Scream routes
app.get('/screams', getAllScreams);
app.post('/createScream', FirebaseAuthMiddleware, postScream);

// User routes
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);
