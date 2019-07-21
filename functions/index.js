const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
const firebase = require('firebase');

admin.initializeApp();

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

app.get('/screams', (req, res) => {
	admin
		.firestore()
		.collection('screams')
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

// signuop routes

app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	// TODO: validate

	firebase
		.auth()
		.createUserWithEmailAndPassword(newUser.email, newUser.password)
		.then((data) => {
			return res.status(201).json({ message: `user ${data.user.uid} signed successfully` });
		})
		.catch((err) => {
			console.error(err);
			return res.status(500).json({ error: err.code });
		});
});

exports.api = functions.https.onRequest(app);
