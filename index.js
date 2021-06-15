const config = require('./config.json');
const constants = require('./constants');

const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');

const db = new Database(config.database, {
    verbose: console.log
});
const app = express();

app.engine('.html', require('eta').__express);

app.use(express.static(path.join(__dirname, 'static')));
app.use(require('cookie-parser')());
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use('*', function(req, res, next) {
    res.db = db;

    next();
});

app.get('/', async function(req, res) {
    let anekdots = db.prepare('SELECT * FROM anek WHERE category = 1 LIMIT 20').all();
    let count = db.prepare('SELECT COUNT(*) FROM anek WHERE category = 1').get();
    let randomAnek = res.db.prepare('SELECT * FROM anek ORDER BY RANDOM() LIMIT 1').get();

    res.render('index', {
        atags: constants.tags,
        anekdots: anekdots,
        count: count['COUNT(*)'],
        anek: randomAnek
    });
});

app.use('/api/v1', require('./controllers/api'));

app.use(function(req, res, next) {
	res.status(404);

    res.render('errors/404');
});

app.listen(config.port, function() {
    console.log(`Running at ${config.port} port`);
});