const constants = require('../constants');
const router = require('express').Router();

router.get('/random', function(req, res) {
	let anek = res.db.prepare('SELECT * FROM anek ORDER BY RANDOM() LIMIT 1').get();

	anek.category = constants.tags[anek.category - 1];

	res.json({
		response: anek
	})
});

router.get('/by_category', function(req, res) {
	if (!req.query.category || !req.query.limit || !constants.tags[req.query.category] || req.query.limit > 30) return res.json({
		response: null
	});

	let count = res.db.prepare('SELECT COUNT(*) FROM anek WHERE category = ?').get(Number(req.query.category) + 1);
	let anek = res.db.prepare('SELECT * FROM anek WHERE category = ? LIMIT ? OFFSET ?').all(
		Number(req.query.category) + 1,
		req.query.limit,
		req.query.offset || 0
	);

	res.json({
		response: anek,
		count: count['COUNT(*)']
	})
});

module.exports = router;