// This is the basic rewriter that acts as a black hole
var Blackhole = (function (){ 
  var BlackholeRewriter = function (config, delegator, logger) {
    this._config = config;
    this._delegator = delegator;
    this._logger = logger.part('rw=blackhole');
  };

  BlackholeRewriter.prototype.clientConnect = function (clientName) {
    if (this._config.log === 'all') {
      this._logger.log('Client ' + clientName + 'connected.');
    }
  };

  BlackholeRewriter.prototype.clientDisconnect = function (clientName) {
    if (this._config.log === 'all') {
      this._logger.log('Client ' + clientName + ' disconnected.');
    }
  };

  BlackholeRewriter.prototype.clientMessage = function (clientName, message) {
    if (this._config.log === 'all' || config.log === 'messages') {
    }
  };

  return BlackholeRewriter;
})();

exports.Rewriter = Blackhole;