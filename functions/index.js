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

const FirebaseAuthMiddleware = (req, res, next) => {
	let idToken;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
		idToken = req.headers.authorization.split('Bearer ')[1];
	} else {
		console.error('No token found');
		return res.status(403).json({ error: 'Unauthorized' });
	}

	// Verifiy token
	admin
		.auth()
		.verifyIdToken(idToken)
		.then((decodedToken) => {
			req.user = decodedToken;
			console.log('Decoded Token', decodedToken);
			return db.collection('users').where('userId', '==', req.user.uid).limit(1).get();
		})
		.then((data) => {
			req.user.handle = data.docs[0].data().handle;
			return next();
		})
		.catch((err) => {
			console.error('Error while verifying token', err);
			return res.status(403).json(err);
		});
};

// Get all screams
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

// Post Scream
app.post('/createScream', FirebaseAuthMiddleware, (req, res) => {
	const newScream = {
		body: req.body.body,
		userHandle: req.user.handle,
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

// Helper FUnctions

const isEmpty = (string) => {
	if (string.trim() === '') return true;
	else return false;
};

const isValidEmail = (email) => {
	const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (email.match(regEx)) return true;
	else return false;
};

// signup routes
app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	// TODO: validate

	let errors = {};

	if (isEmpty(newUser.email)) {
		errors.email = 'Must not be empty';
	} else if (!isValidEmail(newUser.email)) {
		errors.email = 'Must be valid email';
	}

	if (isEmpty(newUser.password)) errors.password = 'Must not be empty';
	if (newUser.password !== newUser.confirmPassword) errors.password = 'Must match';
	if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

	if (Object.keys(errors).length > 0) return res.status(400).json(errors);

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

// Login Routes
app.post('/login', (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	// TODO: validation
	let errors = {};

	if (isEmpty(user.email)) errors.email = 'Must not be empty';
	if (isEmpty(user.password)) errors.password = 'must not be empty';

	if (Object.keys(errors).length > 0) return res.status(400).json(errors);

	// Firebase authetication
	firebase
		.auth()
		.signInWithEmailAndPassword(user.email, user.password)
		.then((data) => {
			return data.user.getIdToken();
		})
		.then((token) => {
			return res.status(200).json({ token });
		})
		.catch((err) => {
			if (err.code === 'auth/wrong-password') {
				return res.status(403).json({ general: 'Wrong credentials , please try again' });
			} else {
				console.error(err);
				return res.status(500).json({ error: err.code });
			}
		});
});

exports.api = functions.https.onRequest(app);
