// This is the basic rewriter to replace the login information
var SingleMITMRewriter = (function (){ 
  var SingleMITMRewriter = function (config, delegator, logger) {
    this._config = config;
    this._delegator = delegator;
    this._logger = logger;
    this._msgLogger = logger.part('MESSAGES');
    this._clients = [];
  };

  SingleMITMRewriter.prototype.clientConnect = function (clientName) {
    this._clients.push(clientName);
    if (this._clients.length > 1) {
      this._logger.warn('You are using forward mode with more than one client! This is NOT supported.');
    }
    if (this._config.log === 'all') {
      this._logger.log('Client ' + clientName + ' connected.');
    }
  };

  SingleMITMRewriter.prototype.clientDisconnect = function (clientName) {
    var clientIndex = this._clients.indexOf(clientName);
    if (clientIndex >= 0) {
      this._clients.splice(clientIndex, 1);
    }
    if (this._config.log === 'all') {
      this._logger.log('Client ' + clientName + ' disconnected.');
    }
  };

  SingleMITMRewriter.prototype.clientMessage = function (clientName, message) {
    if (this._clients.indexOf(client) < 0) {
      this._logger.warn('Client ' + clientName + ' not registered. Dropping message');
    }
    if (this._config.log === 'all' || this._config.log === 'messages') {
      this._msgLogger.part(clientName).log(message);
    }
    this._delegator.sendServer(message);
  };

  SingleMITMRewriter.prototype.serverMessage = function (message) {
    if (this._config.log === 'all' || this._config.log === 'messages') {
      this._msgLogger.part('SERVER').log(message);
    }
    for (var i = 0; i < this._clients.length; i++) {
      this._delegator.sendClient(this._clients[i], message);
    }
  };

  return SingleMITMRewriter;
})();

exports.Rewriter = SingleMITMRewriter;