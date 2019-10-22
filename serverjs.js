const express = require('express'),
	app = express(),
	server = require('http').createServer(app).
	io = require('socket.io')(server);


server.listen(process.env.PORT);

app.use(express.static('public'));

var lang = JSON.parse(fs.readFile(__dirname + '/lang.json', 'utf8'));

io.on('connection', function(socket) {
	console.log('Nueva conexion')
	socket.emit('mensajes', lang.mensajes.bienvenida);
})

