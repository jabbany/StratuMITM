const crypto = require('crypto');

exports.StratuMITM = (function () {
  var Client = function (socket, logger) {
    this.socket = socket;
    // Name self
    var hash = crypto.createHash('sha256');
    hash.update(socket.remoteAddress + ':' + socket.remotePort);
    this.name = 'CL+' + hash.digest('hex');

    this.mode = 'detect';
    this.logger = logger.part(this.name);
  };

  Client.prototype.parseMessages = function (rawData, catcher) {
    if (this.mode === 'http') {
      var request = rawData.split('\r\n\r\n', 2);
      if (request.length === 0) {
        this.logger.part('recv').error('Using protocol HTTP but no body found.');
        return;
      }
      var head = request[0], body = request[1];
      // Create the header lines
      var headerLines = head.trim().split('\r\n');
      if (headerLines[0].startsWith('GET ') ||
        headerLines[0].startsWith('HEAD ')) {
        // This would not be handled later so it must be handled NOW
        this.logger.part('handle').warn('Got HTTP read message. ' +
          'Responding with error.');
        this.write({
          'id': null,
          'error': 'Method not supported.'
        });
        return;
      }
      // Try to trim the message
      try {
        catcher(JSON.parse(body));
      } catch (e) {
        this.logger.part('recv').error(e);
        this.logger.part('recv').part('raw').error(body);
      }
    } else {
      var messages = rawData.trim().split('\n');
      for(var i = 0; i < messages.length; i++) {
        if (messages[i].trim() === '') {
          continue;
        }
        try {
          catcher(JSON.parse(messages[i].trim()));
        } catch (e) {
          this.logger.part('recv').error(e);
          this.logger.part('recv').part('raw').error(rawData.trim());
        }
      }
    }
  };

  Client.prototype.write = function (message) {
    if (this.mode === 'http') {
      var msg = JSON.stringify(message);
      this.socket.write('HTTP/1.1 200 OK\r\n');
      this.socket.write('Server: stratumitm\r\n');
      this.socket.write('Content-Type: application/json;charset=UTF-8\r\n');
      this.socket.write('Content-Length: ' + msg.length + '\r\n\r\n');
      this.socket.write(msg);
    } else {
      this.socket.write(JSON.stringify(message) + '\n');
    }
  };

  var StratuMITM = function (delegator, rewriter, logger) {
    this.delegator = delegator;
    this.rewriter = rewriter;
    this.logger = logger;
  };

  StratuMITM.prototype.createClient = function (socket, logger) {
    return new Client(socket, logger ? logger : this.logger);
  };

  StratuMITM.prototype.getHandler = function (name) {
    var delegator = this.delegator;
    var rewriter = this.rewriter;
    var logger = this.logger.part(name);
    return (function (socket) {
    	socket.setNoDelay(true);
    	socket.setEncoding('UTF8');
    	
      var client = this.createClient(socket, logger);

      delegator.registerLocal(client.name, client);
      rewriter.clientConnect(client.name);

    	socket.on('data', function (data) {
        if (client.mode === 'detect') {
          if (data.startsWith('GET') || data.startsWith('POST') ||
            data.startsWith('HEAD')) {

            client.mode = 'http';
          } else {
            client.mode = 'json';
          }
        }

        client.parseMessages(data, function (message){
          rewriter.clientMessage(client.name, message);
        });
    	})
    	
    	socket.on('close', function () {
        rewriter.clientDisconnect(client.name);
    	});
    }).bind(this);
  }
  return StratuMITM;
})();