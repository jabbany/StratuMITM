// This is the basic rewriter that acts as a black hole
var Blackhole = (function (){ 
  var ForwardingRewriter = function (config, delegator, logger) {
    this._config = config;
    this._delegator = delegator;
    this._logger = logger;
    this._msgLogger = logger.part('MESSAGES');
  };

  ForwardingRewriter.prototype.clientConnect = function (clientName) {
    if (this._config.log === 'all') {
      this._logger.log('Client ' + clientName + 'connected.');
    }
  };

  ForwardingRewriter.prototype.clientDisconnect = function (clientName) {
    if (this._config.log === 'all') {
      this._logger.log('Client ' + clientName + ' disconnected.');
    }
  };

  ForwardingRewriter.prototype.clientMessage = function (clientName, message) {
    if (this._config.log === 'all' || config.log === 'messages') {
      this._msgLogger.part(clientName).log(message);
    }
  };

  ForwardingRewriter.prototype.serverMessage = function (message) {
    if (this._config.log === 'all' || config.log === 'messages') {
      this._msgLogger.part('REMOTE').log(message);
    }
  };

  return Blackhole;
})();

exports.Rewriter = Blackhole;