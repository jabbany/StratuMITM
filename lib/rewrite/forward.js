// This is the basic rewriter that does nothing.
// It doesn't actually handle multiple clients and handles like a repeater
var ForwardingRewriter = (function (){ 
  var ForwardingRewriter = function (config, delegator, logger) {
    this._config = config;
    this._delegator = delegator;
    this._logger = logger;
    this._msgLogger = logger.part('MESSAGES');
    this._clients = [];
  };

  ForwardingRewriter.prototype.clientConnect = function (clientName) {
    this._clients.push(clientName);
    if (this._clients.length > 1) {
      this._logger.warn('You are using forward mode with more than one client! This is NOT supported.');
    }
    if (this._config.log === 'all') {
      this._logger.log('Client ' + clientName + ' connected.');
    }
  };

  ForwardingRewriter.prototype.clientDisconnect = function (clientName) {
    var clientIndex = this._clients.indexOf(clientName);
    if (clientIndex >= 0) {
      this._clients.splice(clientIndex, 1);
    }
    if (this._config.log === 'all') {
      this._logger.log('Client ' + clientName + ' disconnected.');
    }
  };

  ForwardingRewriter.prototype.clientMessage = function (clientName, message) {
    if (this._clients.indexOf(clientName) < 0) {
      this._logger.warn('Client ' + clientName + ' not registered. Dropping message');
      return;
    }
    if (this._config.log === 'all' || this._config.log === 'messages') {
      this._msgLogger.part(clientName).log(message);
    }
    this._delegator.sendServer(message);
  };

  ForwardingRewriter.prototype.serverMessage = function (message) {
    if (this._config.log === 'all' || this._config.log === 'messages') {
      this._msgLogger.part('REMOTE').log(message);
    }
    for (var i = 0; i < this._clients.length; i++) {
      this._delegator.sendClient(this._clients[i], message);
    }
  };

  return ForwardingRewriter;
})();

exports.Rewriter = ForwardingRewriter;