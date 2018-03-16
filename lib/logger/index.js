const colors = require('colors/safe');
var ConsoleLogger = (function () {
  var BaseLogger = function (params) {
    this._params = params == null ? {} : params;
  };
  BaseLogger.prototype.address = function (prefix) {
    if (!('truncate' in this._params) || this._params.truncate.length === 0) {
      return '[' + prefix.join('.') + '] ';
    }
    var addr = '';
    for (var i = 0; i < prefix.length; i++) {
      if (i > 0) {
        addr += '.';
      }
      if (prefix[i].length > this._params.truncate.length) {
        addr += this._params.truncate.mode === 'msb' ?
          (prefix[i].substring(0, this._params.truncate.length - 1) + '*') :
          ('*' + prefix[i].substring(prefix[i].length -
            this._params.truncate.length + 1));
      } else {
        addr += prefix[i];
      }
    }
    return '[' + addr + '] ';
  };
  BaseLogger.prototype.normalize = function (message) {
    if (typeof message === 'number' || typeof message === 'string') {
      return message;
    } else if (message instanceof Error) {
      if (typeof message.stack === 'string') {
        return message.stack;
      } else {
        return message.toString();
      }
    } else {
      return JSON.stringify(message);
    }
  };
  BaseLogger.prototype.log = function (prefix, message) {
    var prefix = this._params.color !== false ?
      colors.grey(this.address(prefix)) : this.address(prefix);
    console.log(prefix + this.normalize(message));
  };

  BaseLogger.prototype.warn = function (prefix, message) {
    var prefix = this._params.color !== false ?
      colors.yellow(this.address(prefix)) : this.address(prefix);
    console.warn(prefix + this.normalize(message));
  };

  BaseLogger.prototype.error = function (prefix, message) {
    var prefix = this._params.color !== false ?
      colors.red(this.address(prefix)) : this.address(prefix);
    console.error(prefix + this.normalize(message));
  };
  
  BaseLogger.prototype.success = function (prefix, message) {
    var prefix = this._params.color !== false ?
      colors.green(this.address(prefix)) : this.address(prefix);
    console.log(prefix + this.normalize(message));
  };

  var ConsoleLogger = function (prefix, params, base) {
    this._prefix = Array.isArray(prefix) ? prefix : [];
    this._params = params == null ? {} : params;
    this._base = base == null ? new BaseLogger(this._params) : base;
  };
  
  ConsoleLogger.prototype.part = function (partName) {
    var newPrefix = this._prefix.slice(0);
    newPrefix.push(partName);
    return new ConsoleLogger(newPrefix, this._params, this._base);
  };
  
  ConsoleLogger.prototype.log = function (message, logLevel) {
    this._base.log(this._prefix, message);
  };

  ConsoleLogger.prototype.warn = function (message, logLevel) {
    this._base.warn(this._prefix, message);
  };

  ConsoleLogger.prototype.error = function (message, logLevel) {
    this._base.error(this._prefix, message);
  };
  
  ConsoleLogger.prototype.success = function (message, logLevel) {
    this._base.success(this._prefix, message);
  }

  return ConsoleLogger;
})();

exports.Logger = ConsoleLogger;