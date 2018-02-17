var ConsoleLogger = (function () {
  var BaseLogger = function () {};
  BaseLogger.prototype.log = function (prefix, message) {
    if (typeof message === 'string' || typeof message === 'number') {
      console.log('[' + prefix.join('.') + '] ' + message);
    } else {
      console.log('[' + prefix.join('.') + '] ' + JSON.stringify(message));
    }
  };

  BaseLogger.prototype.warn = function (prefix, message) {
    if (typeof message === 'string' || typeof message === 'number') {
      console.warn('[' + prefix.join('.') + '] ' + message);
    } else {
      console.warn('[' + prefix.join('.') + '] ' + JSON.stringify(message));
    }
  };

  BaseLogger.prototype.error = function (prefix, message) {
    if (typeof message === 'string' || typeof message === 'number') {
      console.error('[' + prefix.join('.') + '] ' + message);
    } else {
      console.error('[' + prefix.join('.') + '] ' + JSON.stringify(message));
    }
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