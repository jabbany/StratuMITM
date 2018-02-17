var net = require('net');
var fs = require('fs');

// My libraries
var sm = require('./lib/stratumitm.js');
var delegator = require('./lib/delegator');
var logger = require('./lib/logger');

var config = {};

// Read the config
if (fs.existsSync("config.json")) {
	config = JSON.parse(fs.readFileSync("config.json"));
} else {
	console.warn('Using sample config file. Please create your own config as config.json.');
	config = JSON.parse(fs.readFileSync("config.sample.json"));
}

var rew = require(config.rewriter);

// Set up the client socket to the main server first
var client = new net.Socket();

// Load the rewriter
var delegator = new delegator.Delegator(client);
var logger = (new logger.Logger()).part('StratuMITM');
var rewriter = new rew.Rewriter(config.params, delegator, logger);

client.setNoDelay(true);
client.setEncoding('UTF8');
client.on('data', function (data) {
	var messages = data.trim().split('\n');
	for (var i = 0; i < messages.length; i++) {
		if (messages[i].trim() === '') {
			continue;
		}
		try {
			rewriter.serverMessage(JSON.parse(messages[i].trim()));
		} catch (e) {
			logger.part('REMOTE').error(e.toString());
			logger.part('REMOTE').error('Message |' + data.trim() + '|');
		}
	}
});

if (config.rewriter !== 'rewrite/blackhole.js') {
	if (config.remote != null) {
		logger.part('REMOTE').log('Connecting to remote Stratum server ' + config.remote.host + ':' + config.remote.port);
		client.connect(config.remote.port, config.remote.host);
	} else {
		logger.part('REMOTE').warn('StratuMITM is not a stratum server. We may crash if attempting to write to unopened remote socket.');
	}
}

// Set up servers on each port
var stratumitm = new sm.StratuMITM(delegator, rewriter, logger);
var servers = [];
for (var i = 0; i < config.ports.length; i++) {
	var name = 'Port=' + config.ports[i];
	servers.push((function (port) {
		var server = net.createServer();
		server.name = name;
		server.on('connection', stratumitm.getHandler(name));
		server.on('error', function (e) {
			logger.part(server.name).log(e.toString());
		});
		server.on('listening', function () {
			logger.part(server.name).log('Listening on ' + server.address().port);
		});
		server.listen(port);
	})(config.ports[i]));
}
