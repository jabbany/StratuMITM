// This is the basic rewriter that opens a server socket each time a client
// connects and does no rewriting whatsoever
var ForwardingRewriter = (function (){ 
  var ForwardingRewriter = function (config, delegator, logger) {
    this._config = config;
    this._delegator = delegator;
    this._log= logger.part('rw=fwd');
    this._clients = {};
  };

  ForwardingRewriter.prototype.clientConnect = function (clientName) {
    // Create a server connection
    var client = {
      'remote': this._delegator.openConnection(
          this._config.remote.host, this._config.remote.port),
      'remoteName': 'R_' + clientName,
      'log': this._log.part(clientName)
    };

    // Register the newly opened connection with the delegator
    this._delegator.registerRemote(client.remoteName, client.remote);

    // Setup the socket information
    var self = this;
    client.remote.retry = this._config.remote.retry;
    client.remote.log = client.log.part('remote');
    client.remote.on('data', function () {
      // Drain the data
      while(this.feed.length > 0) {
        // Pipe this message to the client
        var message = this.feed.shift();
        if (self._config.log === 'all') {
          this.log.log(message);
        }
        self.serverMessage(client.remoteName, message);
      }
    });
    
    // Open the connection
    client.remote.connect();

    // Add it to the list
    this._clients[clientName] = client; 

    if (this._config.log === 'all') {
      this._log.log('Client ' + clientName + ' connected.');
    }
  };

  ForwardingRewriter.prototype.clientDisconnect = function (clientName) {
    // If the client goes offline, kill the server connection too
    if (this._config.log === 'all') {
      this._log.log('Client ' + clientName + ' disconnected.');
    }
    if (clientName in this._clients) {
      // Close the remote socket
      this._clients[clientName].remote.socket.end();
      delete this._clients[clientName];
    } else {
      this._log.warn('Client ' + clientName + 
        ' not registered but received disconnect event.');
    }
  };

  ForwardingRewriter.prototype.clientMessage = function (clientName, message) {
    if (!clientName in this._clients) {
      this._log.warn('Client ' + clientName + ' not registered. Dropping message');
      return;
    }
    var client = this._clients[clientName];
    if (this._config.log === 'all' || this._config.log === 'messages') {
      client.log.part('local').log(message);
    }
    this._delegator.sendRemote(client.remoteName, message);
  };

  ForwardingRewriter.prototype.serverMessage = function (serverName, message) {
    // We retrieve the client name from the server name
    this._delegator.sendLocal(serverName.substring(2), message);
  };

  return ForwardingRewriter;
})();

exports.Rewriter = ForwardingRewriter;