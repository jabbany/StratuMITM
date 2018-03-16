var fs = require('fs');

var ConfigReader = (function () {
  var ConfigReader = function (defaults) {
    this._defaults = {};
  };
  
  ConfigReader.prototype.read = function (filename, fallback) {
    var config = {};
    try {
      config = JSON.parse(fs.readFileSync(filename));
    } catch (e) {
      try {
        config = JSON.parse(fs.readFileSync(fallback));
      } catch (e) {
        throw new Error(
          'Both file and fallback config files could not be read! ' + 
          e.toString());
      }
    }
    // Fill in anything that was not filled
    for (var key in this._defaults) {
      if (!key in config) {
        config[key] = this._defaults[key];
      }
    }
    return config;
  };

  return ConfigReader;
})();

exports.ConfigReader = ConfigReader;
exports.FALLBACK_CONFIG = {
  "ports": [6666],
  "logger": {
    "mode": "console",
    "params": {
      "color": true
    }
  },
  "rewriter": "./lib/rewrite/blackhole.js",
  "params": {
    "log": "all",
  }
};