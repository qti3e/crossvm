'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerVMDef = registerVMDef;
exports.createContext = createContext;
exports.run = run;

var _bridge = require('./bridge');

var _bridge2 = _interopRequireDefault(_bridge);

var _job = require('./job');

var _job2 = _interopRequireDefault(_job);

var _utils = require('./utils');

var _transpiler = require('./transpiler');

var _transpiler2 = _interopRequireDefault(_transpiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!global.crossVMInit) {
  global.crossVMInit = true;
  global.crossVMRefs = {};
  global.crossVMDef = {
    // console: ...
  };
  global.crossVMRequire = (0, _utils.createGlobalRef)(require);
  global.crossVMDefRef = (0, _utils.createGlobalRef)(global.crossVMDef);
}

function registerVMDef(name, method) {
  this.crossVMDef[name] = method;
}

function createContext() {
  return (0, _utils.createGlobalRef)({});
}

function run(code, context, require) {
  var bridge = new _bridge2.default();
  var PubRef = (0, _utils.createGlobalRef)(bridge) + '.pub';
  var RequireRef = typeof require === 'string' ? require : null;
  if (!RequireRef) {
    RequireRef = typeof require === 'function' ? (0, _utils.createGlobalRef)(require) : global.crossVMRequire;
  }
  var job = new _job2.default(bridge);
  try {
    code = (0, _transpiler2.default)(code);
    code = 'try{\n      ' + PubRef + '({type: \'push\', data: \'running\'});\n      var data = (function(global, require){\n        (function(pub, _Defs_){\n          for(let key of _Defs_){\n            global[key] = _Defs_[key](pub)\n          }\n        })(' + PubRef + ', ' + global.crossVMDefRef + ')\n        ' + code + '\n      })(' + context + ', ' + RequireRef + ')\n      ' + PubRef + '({type: \'result\', data: data})\n      ' + PubRef + '({type: \'rm\', data: \'running\'});\n    } catch(e){\n      ' + PubRef + '({type: \'crashed\', data: e});\n    }';
    (0, _utils.globalEval)(code);
  } catch (e) {
    bridge.pub({ type: 'crashed', data: e });
  }
  return job;
}