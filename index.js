var fs = require('fs')
  , _ = require('lodash')

var Config = module.exports = (function() {
  function Config (path, environment, strict) {
    this.path = path || process.cwd() + '/config'
    this.environment = environment || process.env.NODE_ENV || 'development'
    this.strict = strict || false

    this._init();
  }

  return Config
})();

Object.defineProperty(Config.prototype, "raw", {
  get: function () {
    return this._config
  }
});

Config.prototype.setPath = function (path) {
  this.path = path;
  this._init();

  return this.path;
}

Config.prototype.get = function(path, d) {
  var paths = path.split('.')
    , current = this._config
    , i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      if (this.strict) throw new Error('Undefined Config Key: ' + path + ', using default ' + d)
      return this.clone(d);
    } else {
      current = current[paths[i]];
    }
  }
  return this.clone(current, d)
}

Config.prototype.clone = function (object, d) {
  if (object instanceof Object && !(object instanceof Array)) {
    object = _.merge(d, object)
    var clone = _.extend(new Config(), this, {_config: object})
    return clone
  } else {
    return object;
  }
}

Config.prototype._init = function () {
  try {
    this._configFile = fs.readFileSync(this.path + '/' + this.environment + '.json')
    this._config = JSON.parse(this._configFile)
  } catch (e) {
    if (e.code === "ENOENT") {
      this._config = {}
    } else {
      throw e
    }
  }
}