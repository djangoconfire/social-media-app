const { db } = require('../util/admin');
const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData } = require('../util/validators');

// Signup
exports.signup = (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	// Validation

	const { errors, valid } = validateSignupData(newUser);
	if (!valid) return res.status(400).json(errors);

	let token, userId;

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
};

// Login
exports.login = (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	// validation
	const { errors, valid } = validateLoginData(user);

	if (!valid) return res.status(400).json(errors);

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
};
