var asyncModule = function(init){
    var instance

    var initing = false
    var waitingDones = []

    var result = function(done){
        if(initing){
            waitingDones.push(done);
        } else {
            if(instance){
                setTimeout(function(){ done(null, instance) }, 0)
            } else {
                initing = true;
                waitingDones.push(done);

                init(function(err, result){
                    initing = false
                    instance = result || err && {err: err}
                    waitingDones.forEach(function(wd){ wd(err, instance) })
                })
            }
        }
    }
    result._isAsyncModule = true
    return result
}

asyncModule.require = function(dirname, modules){
    return function(done){
        asyncModule._require(dirname, modules, done);
    }
}

var path = require("path")
asyncModule._require = function(dirname, modules, done, _loadedModules){
    modules = [].concat(modules)
    if(dirname){
        modules = modules.map(function(s){ return s.indexOf(".") == 0 ? path.resolve(dirname, s) : s })
        dirname = null;
    }
    _loadedModules = _loadedModules || { err: null, modules: [] }

    if(modules.length == 0){
        done.apply(null, [_loadedModules.err].concat(_loadedModules.modules))
    } else {
        var moduleName = modules[0],
            module = require(moduleName)
        if(module._isAsyncModule){
            module(function(err, result){
                if(err){
                    _loadedModules.err = _loadedModules.err || {}
                    _loadedModules.err[moduleName] = err
                }
                _loadedModules.modules.push(result)
                asyncModule._require(dirname, modules.slice(1), done, _loadedModules)
            })
        } else {
            _loadedModules.modules.push(module)
            asyncModule._require(dirname, modules.slice(1), done, _loadedModules)
        }
    }
}

module.exports = asyncModule