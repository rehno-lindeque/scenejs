/**
 * Backend that manages debugging configurations.
 *
 * @private
 */
SceneJS._debugModule = new (function() {

    this.configs = {};

    this.getConfigs = function(path) {
        if (!path) {
            return this.configs;
        } else {
            var cfg = this.configs;
            var parts = path.split(".");
            for (var i = 0; cfg && i < parts.length; i++) {
                cfg = cfg[parts[i]];
            }
            return cfg || {};
        }
    };

    this.setConfigs = function(path, data) {
        if (!path) {
            this.configs = data;
        } else {
            var parts = path.split(".");
            var cfg = this.configs;
            var subCfg;
            var name;
            for (var i = 0; i < parts.length - 1; i++) {
                name = parts[i];
                subCfg = cfg[name];
                if (!subCfg) {
                    subCfg = cfg[name] = {};
                }
                cfg = subCfg;
            }
            cfg[parts.length - 1] = data;
        }
    };

})();

/** Sets debugging configurations. 
 */
SceneJS.setDebugConfigs = function () {
    if (arguments.length == 1) {
        SceneJS._debugModule.setConfigs(null, arguments[0]);
    } else if (arguments.length == 2) {
        SceneJS._debugModule.setConfigs(arguments[0], arguments[1]);
    } else {
        throw "Illegal arguments given to SceneJS.setDebugs - should be either ({String}:name, {Object}:cfg) or ({Object}:cfg)";
    }
};

/** Gets debugging configurations
 */
SceneJS.getDebugConfigs = function (path) {
    return SceneJS._debugModule.getConfigs(path);
};

