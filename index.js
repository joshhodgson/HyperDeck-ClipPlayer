var HyperdeckLib = require("hyperdeck-js-lib");

var hyperdeck = new HyperdeckLib.Hyperdeck("192.168.1.12");
hyperdeck.onConnected().then(function () {
	// connected to hyperdeck
	// Note: you do not have to wait for the connection before you start making requests.
	// Requests are buffered until the connection completes. If the connection fails, any
	// buffered requests will be rejected.
	hyperdeck.makeRequest("device info").then(function (response) {
		console.log("Got response with code " + response.code + ".");
		console.log("Hyperdeck unique id: " + response.params["unique id"]);
	}).catch(function (errResponse) {
		if (!errResponse) {
			console.error("The request failed because the hyperdeck connection was lost.");
		} else {
			console.error("The hyperdeck returned an error with status code " + errResponse.code + ".");
		}
	});

	hyperdeck.clipsGet().then(function (response) {
		console.log("God response about clips with code " + response.code);
		console.log("Number of clips : " + response.params["clip count"])
		console.log(response.params)

	});

	hyperdeck.getNotifier().on("asynchronousEvent", function (response) {
		console.log("Got an asynchronous event with code " + response.code + ".");
	});

	hyperdeck.getNotifier().on("connectionLost", function () {
		console.error("Connection lost.");
	});
}).catch(function () {
	console.error("Failed to connect to hyperdeck.");
});





var express = require('express');
var app = express();
app.use(express.static('public'));
var server = app.listen(80);
console.log("Listening at ~:80");
var io = require('socket.io')(server);

io.on('connection', function (socket) {
	socket.on('test', function (payload) {
		console.log("Test message: " + payload);
	});


	socket.on('getClips', function (payload) {


		hyperdeck.clipsGet().then(function (response) {
			console.log("God response about clips with code " + response.code);
			console.log("Number of clips : " + response.params["clip count"])
			console.log(response.params)
			var clips = []
			for (i in response.params) {
				clips.push({
					id: i,
					name: response.params[i],
					duration: response.params[i]
				})

			}

			io.emit('clips', clips)


		});
	})


	socket.on('playClip', function (payload) {
		console.log("playing clip " + payload)

		hyperdeck.makeRequest("		goto: clip id: " + payload).then(function (response) {
			console.log("Got response with code " + response.code + ".");

			hyperdeck.makeRequest("play: single clip: true").then(function (response) {
				console.log("Got response with code " + response.code + ".");

			})
		}).catch(function (errResponse) {
			if (!errResponse) {
				console.error("The request failed because the hyperdeck connection was lost.");
			} else {
				console.error("The hyperdeck returned an error with status code " + errResponse.code + ".");
			}
		});


	});

	socket.on('goToClip', function (payload) {
		console.log("Going to clip " + payload)
		hyperdeck.makeRequest("		goto: clip id: " + payload).then(function (response) {
			console.log("Got response with code " + response.code + ".");
		}).catch(function (errResponse) {
			if (!errResponse) {
				console.error("The request failed because the hyperdeck connection was lost.");
			} else {
				console.error("The hyperdeck returned an error with status code " + errResponse.code + ".");
			}
		});
	});

	socket.on('play', function (payload) {
		console.log("Play")
		hyperdeck.play()
	})
	socket.on('stop', function (payload) {
		console.log("Stop")
		hyperdeck.stop()
	})


});