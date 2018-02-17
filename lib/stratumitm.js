exports.StratuMITM = (function () {
  var StratuMITM = function (delegator, rewriter, logger) {
    this.delegator = delegator;
    this.rewriter = rewriter;
    this.logger = logger;
  };
  
  StratuMITM.prototype.getHandler = function (name) {
    var delegator = this.delegator;
    var rewriter = this.rewriter;
    var logger = this.logger.part(name);
    return function (socket) {
    	socket.setNoDelay(true);
    	socket.setEncoding('UTF8');
    	
    	// Name and register this client
    	socket.name = 'CL/' + socket.remoteAddress + ':' + socket.remotePort;
    	delegator.registerClient(socket.name, socket);
    	rewriter.clientConnect(socket.name);

    	socket.on('data', function (data) {
    		var messages = data.trim().split('\n');
    		for(var i = 0; i < messages.length; i++) {
    			if (messages[i].trim() === '') {
    				continue;
    			}
    			try {
    				rewriter.clientMessage(socket.name, JSON.parse(messages[i].trim()));
    			} catch (e) {
    				logger.part(socket.name).error(e.toString());
    				logger.part(socket.name).error('Message |' + data.trim() + '|');
    			}
    		}
    	})
    	
    	socket.on('close', function () {
    		rewriter.clientDisconnect(socket.name);
    	});
    };
  }
  return StratuMITM;
})();