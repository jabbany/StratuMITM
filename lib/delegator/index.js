var net = require('net');

var Server = (function () {
  var Server = function (host, port) {
    this.host = host;
    this.port = port;
  
    // Should be updated by the consumer of this server
    this.log = null;
    this.retry = 0;
    this.protocol = 'json';
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
      if (this.protocol === 'http') {
        // JSON-RPC over http
        this.handleRawData(data, 'http');
      } else if (this.protocol === 'unknown') {
        // Do some protocol detection
        if (data.startsWith('GET') || data.startsWith('POST') ||
          data.startsWith('HEAD')) {
          this.protocol = 'http';
        } else {
          this.protocol = 'json';
        }
      } else {
        // Default to the JSON-RPC raw
        this.handleRawData(data, 'json');
      }
      this.emit('data');
    }).bind(this));
    
    this.socket.on('close', (function (data) {
      this.emit('close');
    }).bind(this));
  };

  Server.prototype.handleRawData = function (rawData, handleMode) {
    if (handleMode === 'json') {
      var messages = rawData.trim().split('\n');
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].trim() === '') {
          continue;
        }
        try {
          this.feed.push(JSON.parse(messages[i].trim()));
        } catch (e) {
          this.log.part('recv').error(e);
        }
      }
    } else if (handleMode === 'http') {
      // Read it in
    } else {
      // Do something
    }
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

  Server.prototype.write = function (message) {
    if (this.socket.destroyed) {
      this.log.part('send').error('Socket ' + this.host + ':' + this.port +
        ' is closed.');
      this.log.part('send').part('message').error(message);
      return;
    }
    if (this.protocol === 'http') {
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
    this._remote[serverName].write(message);
  };

  Delegator.prototype.sendLocal = function (clientName, message) {
    this._local[clientName].write(message);
  };
  return Delegator;
})();
exports.Delegator = Delegator;