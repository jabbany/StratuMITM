var net = require('net');

var Server = (function () {
  var Server = function (host, port) {
    this.host = host;
    this.port = port;
  
    // Should be updated by the consumer of this server
    this.log = null;
    this.retry = 0;
    this._retryCount = 0;

    // Local stuff
    this.socket = new net.Socket();
    this.feed = [];
    this.handlers = {};
  
    this.socket.setNoDelay(true);
    this.socket.setEncoding('UTF8');

    this.socket.on('error', (function (e) {
      if (this.log) {
        this.log.error(e);
      }
      // Clear feed 
      this.feed = [];
      if (this.retry > 0) {
        // Actually retry connecting
      }
      this.emit('error');
    }).bind(this));
    
    this.socket.on('data', (function (data) {
      var messages = data.trim().split('\n');
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].trim() === '') {
          continue;
        }
        try {
          this.feed.push(JSON.parse(messages[i].trim()));
        } catch (e) {
          this.log.part('RECV').error(e.toString());
        }
      }
      this.emit('data');
    }).bind(this));
  };
  
  Server.prototype.on = function (eventName, handler) {
    if (!(eventName in this.handlers)) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler.bind(this));
  };

  Server.prototype.emit = function (eventName) {
    if (Array.isArray(this.handlers[eventName])) {
      for (var i = 0; i < this.handlers[eventName].length; i++) {
        this.handlers[eventName][i]();
      }
    }
  };

  Server.prototype.connect = function () {
    this.socket.connect(this.port, this.host);
  };

  return Server;
})();

var Delegator = (function () {
  var Delegator = function () {
    this._remote = {};
    this._local = {};
  };

  Delegator.prototype.openConnection = function (host, port) {
    return new Server(host, port);
  };

  Delegator.prototype.registerRemote = function (serverName, serverInstance) {
    this._remote[serverName] = serverInstance;
  };

  Delegator.prototype.registerLocal = function (clientName, socket) {
    this._local[clientName] = socket;
  };

  Delegator.prototype.sendRemote = function (serverName, message) {
    this._remote[serverName].socket.write(JSON.stringify(message) + '\n');
  };

  Delegator.prototype.sendLocal = function (clientName, message) {
    this._local[clientName].write(JSON.stringify(message) + '\n');
  };
  return Delegator;
})();
exports.Delegator = Delegator;