const express = require('express'),
	app = express(),
	mysql = require('mysql')
	cookieParser = require('cookie-parser'),
	crypto = require('crypto'),
	bodyParser = require('body-parser'), 
	request = require('request'),
	qrcode = require('qrcode'),
	fs = require('fs'),
	jimp = require('jimp'),
	QRReader = require('qrcode-reader');

var sesiones = [];


app.use(cookieParser());
app.use(bodyParser.json());

/*app.use(function(req, res, next) {
	var cookie = req.cookies.sesion;
	if(cookie === undefined) {
		//res.sendStatus(403);
		res.redirect('/Ilogin')
		//var randomNumber = Math.random().toString();
		//randomNumber = randomNumber.substring(2, randomNumber.length);
		//console.log(randomNumber)
		//res.cookie('sesion', randomNumber, {maxAge: 900000, httpOnly: true});
		//console.log('Cookie created successfully');
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
	}
	next();
})

*/

app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 1337, function() {
	console.log('Puerto :' + (process.env.PORT || 1337))
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

callSendAPI(3092961217388569, 'XDXD');


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



// A

app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        
        handlePostback(sender_psid, webhook_event.postback);
      }
      
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

function handleMessage(sender_psid, received_message) {
  let response;
  
  // Checks if the message contains text
  if (received_message.text) {    
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
    }
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    var fiesta = readQR(attachment_url);
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Quieres unirte a la fiesta?" + fiesta,
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  } 
  
  // Send the response message
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
   let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

function readQR(url) {
	request.get("http://api.qrserver.com/v1/read-qr-code/?fileurl=" + decodeURIComponent(url))
		.on('response', function(res) {
			console.log(res)
		})
}