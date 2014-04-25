/**
 * HID scanner reader for Beep System
 * Author: Jossemar Cordero (jossemargt@gmail.com)
 *
 * Dependencies:
 * Check package.json and
 * virtual keys (Unix like) support: http://lxr.free-electrons.com/source/include/uapi/linux/input.h
 * 
 * A little inspiration from:
 * Bornholm - node-keyboard:  https://github.com/Bornholm/node-keyboard
 * 
 * PS: I'm kind of newbie with nodejs (pure javascript), so... pardon me if I commit some sort of sin D: 
 */

var location = '';

// Getting args, which must to have the location ID ---------------------
if( process.argv.length < 3 ) {
	console.log('No enough arguments');
	process.exit(0)
} else {
	location = process.argv[2]
}

// Get master config
var confObj = require('./master_config').config;
var apiUrl = confObj.api_url;

// HID instances (barcode scanners)-------------------------------------
var HID = require('./node_modules/node-hid'),
	barVendorID = 3118,
	barDeviceID = 2561,
	hidDevices =  HID.devices(barVendorID, barDeviceID),
	hidBarcodes = [];

// HTTP instances (socket.io and http.get)--------------------------------
var http = require('http')
	, app = http.createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

// Mongo stuff ------------------------------------------------------------
var db = require('./mongod_config').db;

// Key mapping (Unix like systems) ----------------------------------------
var Keys = require('./keymap').keymap ;
	
// Barcode Init -----------------------------------------------------------
HID.HID.prototype.scanString = null;
HID.HID.prototype.devID = -1;
HID.HID.prototype.devInt = -1;
HID.HID.prototype.readEvent = dataRead

var devCount = 0;

hidDevices.forEach(function(rawBarcode){
	// For the Honeywell Voyager 1200g, the 
	// interface 0 has the behavior of keyword-wrench
	
	if(rawBarcode.interface !== 0)
		return true;
		
	console.log(rawBarcode.path);
	
	barcode = new HID.HID(rawBarcode.path);
	barcode.scanString = ''
	barcode.devID = devCount;
	barcode.devInt = rawBarcode.interface;
	
	barcode.on('data', barcode.readEvent.bind(barcode) );
	hidBarcodes.push(barcode);
	devCount += 1;

	})
	
// console.log(hidDevices);
// console.log(hidBarcodes);

function dataRead(data) {
	//data is a buffer :D
	var that = this;
		
	for (var i = 0; i < data.length ; i++) {
		var element = data[i];
		
		if(element !== 0){
			//Is a number which means a virtual key as linux does
			
			if ( element === 0x51 ) {
				
				var p = Math.floor ( Math.random() * phrases.length ) ;
				
				//Has 6hs drift 
				var ttime = (new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '')
								
				db.collection('log').insert({ kidID: that.scanString, location : location, ts :ttime }, function(err, result) {});
				
				//TODO: Use request instead of get method >> http://nodejs.org/api/http.html#http_http_request_options_callback
				//BUG: Needs error handling (ex.: error on connection)
				http.get(apiUrl+"?id="+that.scanString+"&locacion="+location).end();
				
				io.sockets.emit('beep', {
					tstring: phrases[p],
					kidID : that.scanString,
					devID : that.devID,
					beepMeta : { timestamp : ttime }
				});
				
				that.scanString = '';

			} else if ( element !== 0x28 ) {
				that.scanString += Keys[element - 0x1c];
			}
		}
	}
		
}

var phrases = [
	"¡Buenos días! No te imaginas lo que Dios tiene para ti hoy.",
	"¡Apresurate, tus amigos te esperan en la clase!",
	"¡Que bueno verte! Dios te sorprenderá hoy.",
	"¡Hola! Estuve esperando porque volvieras.",
	"¡Vamos! Hoy es un nuevo día y buscarémos de Dios.",
	"¡Hoy conocerás a mi mejor amigo! ¡Jesús!",
	"No se es demasiado joven para ser usado por Dios."
];

//-------------------------------------------------------------------
app.listen(1334);

function handler (req, res) {
  fs.readFile(__dirname + '../beep_front/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.set('log level', 2);

io.sockets.on('connection', function (socket) {
  socket.emit('beep-init', { devCount: devCount });
	
  socket.on('beep-request', function (data) {
    console.log(data);
  });
	
	socket.on('beep-adm-action', function(data) {
		//console.log(data);
		if ('shutdown' === data.action) {
			db.close();
			for(var i = 0; i < devCount; i++ ){
				hidBarcodes[i].close();
			}
			socket.emit('beep-close-app', {});
			process.exit(0);
		}
	});
});


/*
	Nasty error handler 
 */
process.on('uncaughtException', function (err) {
  console.log(err);
	db.close();
	for(var i = 0; i < devCount; i++ ){
		hidBarcodes[i].close();
	}
	socket.emit('beep-error-fatal', {});
	process.exit(1);
})
