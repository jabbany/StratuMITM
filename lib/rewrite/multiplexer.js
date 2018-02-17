// This is a fancy multiplexing rewriter that just multiplexes
var Multiplexer = (function () {
  var COMPLETE_HELLO = 3; 
  var Multiplexer = function (config, delegator, logger) {
    this._config = config;
    this._delegator = delegator;
    this._logger = logger;
    this._msgLogger = logger.part('MESSAGES');
    this._handshakeState = 0;

    this._clients = {
      '': {'expect': -1}
    };
    this._lastId = 0;
    this._lastResponseId = 0;
    
    // Send a hello message to the server;
    this.handshake();
  };

  Multiplexer.prototype.server = function (message) {
    this._lastId++;
    message.id = this._lastId;
    this._delegator.sendServer(message);
  };

  Multiplexer.prototype.expectResponse = function (clientName) {
    this._clients[clientName].expect = this._lastId;
  };

  Multiplexer.prototype.handshake = function (response) {
    if (this._handshakeState >= COMPLETE_HELLO) {
      this._logger.warn('Already said hello. Ignoring request.');
      return;
    }
    
    switch(this._handShakeState) {
      case 0:
        this.server({
          'method': 'mining.subscribe',
          'params': ['StratuMITM/Multiplex0.1.0', 'NotANonce',this._config.poolName, this._config.poolPort]
        });
        this.expectResponse('');
        break;
      case 1:
        this.server({
          'method': 'mining.authorize',
          'params': [this._config.username, this._config.password]
        });
        this.expectResponse('');
      case 2:
        this.server({
          'method': 'mining.extranonce.subscribe',
          'params': []
        });
        this.expectResponse('');
    }
    this._handshakeState += 1;
  }
  
  Multiplexer.prototype.broadcast = function (message, preserveId) {
    // broadcast to everyone
    if (!preserveId) {
      message.id = null;
    }
    for (var client in this._clients) {
      if (client === '') {
        continue; // Ignore the system one
      }
      this._delegator.sendClient(client, message);
    }
  };

  Multiplexer.prototype.clientConnect = function (clientName) {
    if (clientName === '') {
      this._logger.warn('Client with empty name connected. Multiplexer reserved. Ignore');
      return;
    }
    this._clients[clientName] = {
      'expect': -1,
      'lastMessageId': -1
    };
  };

  Multiplexer.prototype.clientDisconnect = function (clientName) {
    if (clientName === '') {
      this._logger.warn('Client with empty name disconnected. Multiplexer reserved. Ignore');
      return;
    }
    delete this._clients[clientName];
  };

  Multiplexer.prototype.clientMessage = function (clientName, message) {
    if (clientName === '') {
      this._logger.warn('Client with empty name sent message. Multiplexer reserved. Ignore');
      return;
    }
    if (this._clients[client] == null) {
      this._logger.warn('Client ' + clientName + ' not registered. Dropping message');
      return;
    }
    if (this._config.log === 'all' || this._config.log === 'messages') {
      this._msgLogger.part(clientName).log(message);
    }
    // Update some params
    this._clients[client].lastMessageId = message.id;
    if (message.method === 'minining.subscribe') {
      this._delegator.sendClient(clientName, {
        'id': this._clients[client].lastMessageId,
        'params': [null, ''],
        'error': null
      });
      return;
    } else if (message.method === 'mining.authorize') {
      // Be accepting
      this._delegator.sendClient(clientName, {
        'id': this._clients[client].lastMessageId,
        'result': true,
        'error': null
      })
      return;
    } else if (message.method === 'mining.extranonce.subscribe') {
      // Ignore this, we don't support this kind of message
      return;
    } else if (message.method === 'mining.submit') {  
      // Found a share, resubmit with the proxy's credentials
      var submission = message.params.slice(1);
      submission.shift(this._config.username);
      this._lastId ++;
      message.id = this._lastId;
      this._delegator.sendServer(message);
      // We expect to get a response
      this.expectResponse(clientName);
      return;
    } else {
      // OK this we actually want to forward to the server verbatim
      this._lastId ++;
      message.id = this._lastId;
      this._delegator.sendServer(message);
    }
  };

  Multiplexer.prototype.serverMessage = function (message) {
    if (this._config.log === 'all' || this._config.log === 'messages') {
      this._msgLogger.part('REMOTE').log(message);
    }
    if (message.id !== null) {
      this._lastResponseId = message.id;
    } else {
      // Always broadcast server-initiated messages to everyone
      this.broadcast(message, true);
      return;
    }
    // Find out if any client expects the message
    // If so only forward it to that client
    for (var client in this._clients) {
      if (this._clients[client].expects === message.id) {
        if (client !== '') {
          message.id = this._clients[client].lastMessageId;
          this._delegator.sendClient(client, message);
          this._clients[client].expects = -1;
        } else {
          this.handshake(response);
        }
        return; // Found a target for the message.
      }
    }
    // If there was no client expecting this particular message
    // broadcast to everyone
    this.broadcast(message, false);
  };

  return Multiplexer;
})();

exports.Rewriter = Multiplexer;