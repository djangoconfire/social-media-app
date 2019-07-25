const { admin, db } = require('../util/admin');

exports.getAllScreams = (req, res) => {
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
};

// Post Scream
exports.postScream = (req, res) => {
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
};
