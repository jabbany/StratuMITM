const colors = require('colors/safe');

var ConsoleLogger = (function () {
  var BaseLogger = function () {};
  BaseLogger.prototype.address = function (prefix) {
    return '[' + prefix.join('.') + '] ';
  };
  BaseLogger.prototype.log = function (prefix, message) {
    var msg;
    if (typeof message === 'string' || typeof message === 'number') {
      msg = colors.grey(this.address(prefix)) + message;
    } else {
      msg = colors.grey(this.address(prefix))+ JSON.stringify(message);
    }
    console.log(msg)
  };

  BaseLogger.prototype.warn = function (prefix, message) {
    var msg;
    if (typeof message === 'string' || typeof message === 'number') {
      msg = colors.yellow(this.address(prefix)) + message;
    } else {
      msg = colors.yellow(this.address(prefix)) + JSON.stringify(message);
    }
    console.warn(msg);
  };

  BaseLogger.prototype.error = function (prefix, message) {
    var msg;
    if (typeof message === 'string' || typeof message === 'number') {
      msg = colors.red(this.address(prefix)) + message;
    } else {
      msg = colors.red(this.address(prefix)) + JSON.stringify(message);
    }
    console.error(msg);
  };
  
  var ConsoleLogger = function (prefix, base) {
    this._prefix = Array.isArray(prefix) ? prefix : [];
    this._base = base == null ? new BaseLogger() : base;
  };
  
  ConsoleLogger.prototype.part = function (partName) {
    var newPrefix = this._prefix.slice(0);
    newPrefix.push(partName);
    return new ConsoleLogger(newPrefix, this._base);
  };
  
  ConsoleLogger.prototype.log = function (message) {
    this._base.log(this._prefix, message)
  };

  ConsoleLogger.prototype.warn= function (message) {
    this._base.warn(this._prefix, message)
  };

  ConsoleLogger.prototype.error = function (message) {
    this._base.error(this._prefix, message)
  };
  
  return ConsoleLogger;
})();

exports.Logger = ConsoleLogger;