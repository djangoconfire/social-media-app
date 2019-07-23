const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
const firebase = require('firebase');

var serviceAccount = require('../credentials/serviceAccountKey.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://social-media-app-c1a2c.firebaseio.com'
});

const firebaseConfig = {
	apiKey: 'AIzaSyDA8bvsAEmlcvs9WmIo0NWbR7MZA7EhEXs',
	authDomain: 'social-media-app-c1a2c.firebaseapp.com',
	databaseURL: 'https://social-media-app-c1a2c.firebaseio.com',
	projectId: 'social-media-app-c1a2c',
	storageBucket: 'social-media-app-c1a2c.appspot.com',
	messagingSenderId: '855301364951',
	appId: '1:855301364951:web:534c0fccfd4707ec'
};

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

let token, userId;

app.get('/screams', (req, res) => {
	db
		.collection('screams')
		.orderBy('createdAt', 'desc')
		.get()
		.then((data) => {
			let screams = [];
			data.forEach((doc) => {
				screams.push({
					screamId: doc.id,
					body: doc.data().body,
					userhandle: doc.data().userHandle,
					createdAt: doc.data().createdAt
				});
			});
			return res.json(screams);
		})
		.catch((err) => console.log(err));
});

app.post('/createScream', (req, res) => {
	const newScream = {
		body: req.body.body,
		userHandle: req.body.userHandle,
		createdAt: new Date().toISOString()
	};

	admin
		.firestore()
		.collection('screams')
		.add(newScream)
		.then((doc) => {
			res.json({ message: `document ${doc.id} created successfully` });
		})
		.catch((err) => {
			res.status(500).json({ error: 'Internal Server Error' });
			console.error(err);
		});
});

// signup routes
app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	// TODO: validate
	db
		.doc(`/users/${newUser.handle}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return res.status(400).json({ handle: 'This handle is already taken' });
			} else {
				return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
			}
		})
		.then((data) => {
			userId = data.user.uid;
			return data.user.getIdToken();
		})
		.then((idToken) => {
			token = idToken;
			const userCredentials = {
				email: newUser.email,
				handle: newUser.handle,
				createAt: new Date().toISOString(),
				userId
			};
			return db.doc(`/users/${newUser.handle}`).set(userCredentials);
		})
		.then((data) => {
			return res.status(201).json({ token });
		})
		.catch((err) => {
			if (err.code === 'auth/email-already-in-use') {
				return res.status(400).json({ email: 'Email is already in use' });
			} else {
				console.error(err);
				return res.status(500).json({ error: err.code });
			}
		});
});

exports.api = functions.https.onRequest(app);
