var net = require('net');

// My libraries
var sm = require('./lib/stratumitm.js');
var delegator = require('./lib/delegator');
var logger = require('./lib/logger');
var confreader = require('./lib/config');

// Create the log
var config = (new confreader.ConfigReader(confreader.FALLBACK_CONFIG)).read(
	'config.json', 'config.sample.json');

var log = new logger.Logger([], config.logger ? config.logger.params : null);
var rewriterClass = require(config.rewriter);

// Load the rewriter
var delegator = new delegator.Delegator();
var rewriter = new rewriterClass.Rewriter(config.params, delegator, log);

// Set up servers on each port
var stratumitm = new sm.StratuMITM(delegator, rewriter, log);

var servers = [];
for (var i = 0; i < config.ports.length; i++) {
	var name = 'Port=' + config.ports[i];
	servers.push((function (port) {
		var server = {
			'socket': net.createServer(),
			'name': name,
			'log': log.part(name)
		};
		server.socket.on('connection', stratumitm.getHandler(name));
		server.socket.on('error', function (e) {
			server.log.error(e);
		});
		server.socket.on('listening', function () {
			server.log.log('Listening on ' + server.socket.address().port);
		});
		server.socket.listen(port);
	})(config.ports[i]));
}
