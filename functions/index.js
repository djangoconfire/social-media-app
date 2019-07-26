const functions = require('firebase-functions');
const app = require('express')();

const { getAllScreams, postScream } = require('./handlers/screams');
const { signup, login, uploadImage } = require('./handlers/users');
const FirebaseAuthMiddleware = require('./util/fbAuth');

// Scream routes
app.get('/screams', getAllScreams);
app.post('/createScream', FirebaseAuthMiddleware, postScream);

// User routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FirebaseAuthMiddleware, uploadImage);

exports.api = functions.https.onRequest(app);
