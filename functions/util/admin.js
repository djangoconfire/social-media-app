const admin = require('firebase-admin');

var serviceAccount = require('../../credentials/serviceAccountKey.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://social-media-app-c1a2c.firebaseio.com'
});

const db = admin.firestore();

module.exports = { admin, db };
