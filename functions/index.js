const functions = require('firebase-functions');
const app = require('express')();

const {
	getAllScreams,
	postScream,
	getScream,
	deleteScream,
	likeScream,
	unlikeScream,
	commentOnScream
} = require('./handlers/screams');

const {
	signup,
	login,
	uploadImage,
	addUserDetails,
	getAuthenticatedUser,
	getUserDetails
} = require('./handlers/users');

const FirebaseAuthMiddleware = require('./util/fbAuth');

// Scream routes
app.get('/screams', getAllScreams);
app.post('/createScream', FirebaseAuthMiddleware, postScream);
app.get('/scream/:screamId', getScream);
app.delete('/scream/:screamId', FirebaseAuthMiddleware, deleteScream);
app.get('/scream/:screamId/like', FirebaseAuthMiddleware, likeScream);
app.get('/scream/:screamId/unlike', FirebaseAuthMiddleware, unlikeScream);
app.post('/scream/:screamId/comment', FirebaseAuthMiddleware, commentOnScream);

// User routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FirebaseAuthMiddleware, uploadImage);
app.post('/user', FirebaseAuthMiddleware, addUserDetails);
app.get('/user', FirebaseAuthMiddleware, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);

exports.api = functions.https.onRequest(app);
