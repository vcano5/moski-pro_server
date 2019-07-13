const express = require('express'),
	app = express(),
	mysql = require('mysql')
	cookieParser = require('cookie-parser'),
	crypto = require('crypto'),
	bodyParser = require('body-parser');

var sesiones = [];

app.use(cookieParser());

app.use(function(req, res, next) {
	var cookie = req.cookies.sesion;
	if(cookie === undefined) {
		//res.sendStatus(403);
		res.redirect('/Ilogin')
		/*
		var randomNumber = Math.random().toString();
		randomNumber = randomNumber.substring(2, randomNumber.length);
		console.log(randomNumber)
		res.cookie('sesion', randomNumber, {maxAge: 900000, httpOnly: true});
		console.log('Cookie created successfully');
		*/
	}
	else {
		var long = sesiones.length;
		var time = 0;
		for (var i = sesiones.length - 1; i >= 0; i--) {
			if(sesiones[i] === cookie) {
				res.sendStatus(200)
				time++;
			}
		}
		if(time == long) {
			res.send('Tu sesion caduco')
			res.clearCookie('sesion')
		}
		//console.log('Cookie exists', cookie);
	}
	next();
})

app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 81, function() {
	console.log('Puerto :' + (process.env.PORT || 81))
})

var pool = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'moski_pro-server',
	password: 'qFEX9ssR5gYFzKU',
	database: 'moski_pro'
})

app.get('/joinParty', function(req, res) {
	if(req.query.nip != undefined) {

	}
})

app.get('/', function(req, res) {
	randomID(8, function(id) {
		console.log(id)
	})
	res.sendStatus(404);
})

app.get('/newDevice', function(req, res) {

});

app.get('/getToken', function(req, res) {

	// Preparando las weas
})

app.post('/login', function(req, res) {
	const secret = 'Mosky-Pro';
	const hash = crypto.createHmac('sha256', secret).update(req.query.password).digest('hex')
	console.log(hash)
	pool.query('SELECT * FROM usuarios WHERE id=?', req.query.id, function(err, resultado) {
		if(err) throw err;
		if(resultado[0].password === req.query.password) {
			randomID(16, function(co) {
				sesiones[sesiones.lenght] = co;
				console.log(co)
				res.cookie('sesion', co);
			})
		}
	})
	res.sendStatus(201);
})

app.get('/scanQR', function(req, res) {

})

app.get('/webhook', function(req, res) {
	let VERIFY_TOKEN = (process.env.VERIFY_TOKEN || 'default_verify_token');
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
	if(mode && token) {
		if(mode == 'subscribe' && token == VERIFY_TOKEN) {
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
		}
		else {
			res.sendStatus(403);
		}
	}
})

app.post('/webhook', function(req, res){
	let body = req.body;
	if(body.object == 'page') {
		body.entry.forEach(function(entry) {
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);
		})
		res.status(200).send('EVENT_RECEIVED')
	}
	else {
		res.sendStatus(404);
	}
})


function randomID(lenght, callback) {
	charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for(var i = 0; i < lenght; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	console.log(randomString);
	return callback(randomString);
}

function responseText(texto) {
	return ('{"messages":[{"text":"' + texto + '"}]}');
}