var Delegator = (function () {
  var Delegator = function (serverSocket) {
    this._serverSocket = serverSocket;
    this._clients = {};
  };

  Delegator.prototype.sendServer = function (message) {
    this._serverSocket.write(JSON.stringify(message) + '\n');
  };

  Delegator.prototype.sendClient = function (clientName, message) {
    this._clients[clientName].write(JSON.stringify(message) + '\n');
  };

  Delegator.prototype.registerClient = function (clientName, socket) {
    this._clients[clientName] = socket;
  };

  return Delegator;
})();
exports.Delegator = Delegator;