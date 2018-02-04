'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JavaScriptPredefinedValues = exports.importFunction = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (code) {
  var tree = acorn.parse(code, acornOptions);
  var vars = JavaScriptPredefinedValues.filter(function (x) {
    return !global.crossVMDef[x];
  });
  Functions.BlockStatement(tree, [].concat(_toConsumableArray(vars), [importFunction, 'global']), true);
  tree = null;

  // merge changes
  changes.sort(function (a, b) {
    return a[0] - b[0];
  });

  changes = changes.filter(function (x, i) {
    return i === 0 || !(changes[i - 1][0] === x[0] && changes[i - 1][1] === x[1]);
  });

  var tmp = [];
  for (var i = 0; i < removes.length; i += 1) {
    var _removes$i = _slicedToArray(removes[i], 2),
        s = _removes$i[0],
        e = _removes$i[1];

    for (var j = s; j < e; j += 1) {
      tmp.push(j);
    }
  }
  (0, _utils.cleanArray)(removes);
  removes = tmp;
  removes = removes.filter(function (x, i) {
    return removes.indexOf(x) === i;
  });
  removes.sort(function (a, b) {
    return a - b;
  });
  code = code.split('');
  var re = [];

  for (var _i2 = 0; _i2 < code.length; _i2 += 1) {
    while (changes[0] && changes[0][0] === _i2) {
      var change = changes.shift();
      re.push(change[1]);
    }
    if (removes[0] === _i2) {
      removes.shift();
      continue;
    }
    re.push(code[_i2]);
  }

  return re.join('');
};

var _utils = require('./utils');

var _acorn = require('acorn');

var acorn = _interopRequireWildcard(_acorn);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var importFunction = exports.importFunction = 'require';

var JavaScriptPredefinedValues = exports.JavaScriptPredefinedValues = '\nArray                 Boolean               Date                  Error\nEvalError             Function              Infinity              JSON\nMath                  NaN                   Number                Object\nRangeError            ReferenceError        RegExp                String\nSyntaxError           TypeError             URIError              decodeURI\ndecodeURIComponent    encodeURI             encodeURIComponent\nisFinite              isNaN                 parseFloat            parseInt\nundefined             ArrayBuffer           Atomics               Buffer\nDataView              Float32Array          Float64Array\nInt16Array            Int32Array            Int8Array             Intl\nMap                   Promise               Proxy                 Reflect\nSet                   SharedArrayBuffer     Symbol                Uint16Array\nUint32Array           Uint8Array            Uint8ClampedArray     WeakMap\nWeakSet               WebAssembly           assert\nasync_hooks           buffer                clearImmediate\nclearInterval         clearTimeout          cluster               console\ncrypto                dgram                 dns                   domain\nescape                events\nhttp                  http2                 https                 module\nnet                   os                    path                  perf_hooks\nprocess               punycode              querystring           readline\nrepl                  require               root                  setImmediate\nsetInterval           setTimeout            stream                string_decoder\ntls                   tty                   unescape              url\nutil                  v8                    vm                    zlib\n__defineGetter__      __defineSetter__      __lookupGetter__      __lookupSetter__\n__proto__             constructor           hasOwnProperty        isPrototypeOf\npropertyIsEnumerable  toLocaleString        toString              valueOf\n'.split(/\s+/g).map(function (x) {
  return x.trim();
}).filter(function (x) {
  return x !== '';
});

var acornOptions = {
  allowImportExportEverywhere: true
};

var add2predefinedVars = [];

var changes = [
  // [start, insertText]
];
var removes = [
  // [start, end]
];

function prepend(_ref, text) {
  var start = _ref.start;

  changes.push([start, text]);
}

function append(_ref2, text) {
  var end = _ref2.end;

  changes.push([end, text]);
}

function remove(obj, end) {
  var start = void 0;
  if (end) {
    start = obj;
  } else {
    start = obj.start;
    end = obj.end;
  }
  removes.push([start, end]);
}

function readFunctionParamsName(params) {
  for (var i = 0; i < params.length; i += 1) {
    add2predefinedVars.push(params[i].name || params[i].left.name);
  }
}

var doNotParse = {
  ForStatement: ['init', 'body']
  // FunctionDeclaration: ['body', 'params'],
  // FunctionExpression: ['body', 'params']
};

var Functions = {
  ImportDeclaration: function ImportDeclaration(obj, predefinedVars, isTopLevel) {
    var re = [];
    remove(obj);
    var f = '\n    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n    ';
    if (obj.specifiers.length === 0) {
      prepend(obj, importFunction + '(' + obj.source.raw + ');');
      return null;
    }

    var declarations = [];
    var declarationPrefix = isTopLevel ? '' : 'let ';
    var prefix = isTopLevel ? 'global.' : '';

    re.push('const _nb_tmp_ = _interopRequireDefault(' + importFunction + '(' + obj.source.raw + '));');

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = obj.specifiers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var specifier = _step.value;

        if (!isTopLevel) {
          declarations.push(specifier.local.name);
        }
        switch (specifier.type) {
          case 'ImportSpecifier':
            re.push('' + prefix + specifier.local.name + ' = _nb_tmp_.' + specifier.imported.name + ';');
            break;
          case 'ImportDefaultSpecifier':
            re.push('' + prefix + specifier.local.name + ' = _nb_tmp_.default;');
            break;
          case 'ImportNamespaceSpecifier':
            re.push('' + prefix + specifier.local.name + ' = _nb_tmp_;');
            break;
          default:
            break;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    prepend(obj, '' + declarationPrefix + declarations.join() + '(function(){' + f + re.join('') + '})()');
    return null;
  },
  ExpressionStatement: function ExpressionStatement(obj, predefinedVars) {
    if (!obj.expression || obj.expression.type !== 'Identifier') {
      return null;
    }
    var name = obj.expression.name;
    if (predefinedVars.indexOf(name) > 0) {
      return null;
    }
    return prepend(obj.expression, 'global.');
  },
  ClassDeclaration: function ClassDeclaration(obj, predefinedVars, isTopLevel) {
    if (predefinedVars.indexOf(obj.id.name) > -1) {
      return null;
    }
    if (obj.superClass && obj.superClass.type === 'Identifier') {
      if (predefinedVars.indexOf(obj.superClass.name) < 0) {
        prepend(obj.superClass, 'global.');
      }
    }
    if (isTopLevel) {
      prepend(obj, 'global.' + obj.id.name + ' = ');
      remove(obj.id);
    }
    return null;
  },
  ClassExpression: function ClassExpression(obj) {
    if (obj.id) {
      for (var _len = arguments.length, etc = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        etc[_key - 1] = arguments[_key];
      }

      return this.ClassDeclaration.apply(this, [obj].concat(_toConsumableArray(etc)));
    }
    readFunctionParamsName(obj.params);
    return null;
  },
  FunctionDeclaration: function FunctionDeclaration(obj, predefinedVars, isTopLevel) {
    readFunctionParamsName(obj.params);
    if (predefinedVars.indexOf(obj.id.name) > -1) {
      return null;
    }
    if (isTopLevel) {
      prepend(obj, 'global.' + obj.id.name + ' = ');
      remove(obj.id);
      return null;
    }
    return null;
  },
  FunctionExpression: function FunctionExpression(obj) {
    if (obj.id) {
      for (var _len2 = arguments.length, etc = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        etc[_key2 - 1] = arguments[_key2];
      }

      return this.FunctionDeclaration.apply(this, [obj].concat(_toConsumableArray(etc)));
    }
    readFunctionParamsName(obj.params);
    return null;
  },
  VariableDeclaration: function VariableDeclaration(obj, predefinedVars, isTopLevel) {
    if (!isTopLevel) {
      for (var i = 0; i < obj.declarations.length; i += 1) {
        predefinedVars.push(obj.declarations[i].id.name);
      }
      return null;
    }
    // remove leading declaration label
    remove(obj.start, obj.declarations[0].start);

    for (var _i = 0; _i < obj.declarations.length; _i += 1) {
      if (_i > 0) {
        // remove space and coma between things
        // let a = 5, b
        // let a = 5[, ]b
        remove(obj.declarations[_i - 1].end, obj.declarations[_i].start);
      }
      if (obj.declarations[_i].init === null) {
        append(obj.declarations[_i].id, ' = null;');
      } else if (_i < obj.declarations.length - 1) {
        append(obj.declarations[_i], ';');
      }
      if (obj.declarations[_i].init && obj.declarations[_i].init.type === 'Identifier') {
        var _name = obj.declarations[_i].init.name;
        if (predefinedVars.indexOf(_name) < 0) {
          prepend(obj.declarations[_i].init, 'global.');
        }
      }
      var name = obj.declarations[_i].id.name;
      if (predefinedVars.indexOf(name) > -1) {
        prepend(obj.declarations[_i].id, obj.kind + ' ');
      } else {
        prepend(obj.declarations[_i].id, 'global.');
      }
    }
    return null;
  },
  ForStatement: function ForStatement(obj, predefinedVars) {
    predefinedVars = (0, _utils.cloneArray)(predefinedVars);
    if (obj.init && obj.init.type === 'VariableDeclaration') {
      // add2predefinedVars.push('x')
      for (var i = 0; i < obj.init.declarations.length; i += 1) {
        predefinedVars.push(obj.init.declarations[i].id.name);
      }
    }
    this.BlockStatement(obj, predefinedVars);
    (0, _utils.cleanArray)(predefinedVars);
  },
  xxxExpression: function xxxExpression(obj, predefinedVars) {
    var keys = ['object', 'left', 'right', 'callee', 'argument'];
    var re = [];
    while (keys.length) {
      var key = keys.shift();
      if (obj[key] && obj[key].type === 'Identifier') {
        var name = obj[key].name;
        if (predefinedVars.indexOf(name) > -1) {
          continue;
        }
        re.push(prepend(obj[key], 'global.'));
      }
    }
    return re;
  },
  CallExpression: function CallExpression(obj, predefinedVars) {
    var re = this.xxxExpression(obj, predefinedVars);
    for (var i = 0; i < obj.arguments.length; i += 1) {
      if (obj.arguments[i].type === 'Identifier') {
        var name = obj.arguments[i].name;
        if (predefinedVars.indexOf(name) > -1) {
          continue;
        }
        re.push(prepend(obj.arguments[i], 'global.'));
      }
    }
    return re;
  },
  ReturnStatement: function ReturnStatement(obj, predefinedVars) {
    if (obj.argument && obj.argument.type === 'Identifier') {
      if (predefinedVars.indexOf(obj.argument.name) === -1) {
        return [prepend(obj.argument, 'global.')];
      }
    }
    return null;
  },
  CatchClause: function CatchClause(obj, predefinedVars) {
    predefinedVars.push(obj.param.name);
    return null;
  },
  BlockStatement: function BlockStatement(tree, predefinedVars) {
    predefinedVars = (0, _utils.cloneArray)(predefinedVars);
    if (add2predefinedVars) {
      while (add2predefinedVars.length) {
        predefinedVars.push(add2predefinedVars.shift());
      }
    }
    var isTopLevel = tree.type === 'Program';

    if (isTopLevel) {
      changes = [];
      removes = [];
      // insert return for expression
      for (var i = tree.body.length - 1; i > 0; i -= 1) {
        var c = tree.body[i];
        if (c.type === 'VariableDeclaration' || c.type === 'ExpressionStatement') {
          var f = i === 0 ? prepend : append;
          f(tree.body[Math.max(0, i - 1)], 'return ');
          break;
        }
      }
    }

    function walk(obj) {
      if (!obj) {
        return;
      }
      var type = obj.type || '';
      if (type.endsWith('Expression') && !Functions[type]) {
        type = 'xxxExpression';
      }
      if (Functions[type]) {
        Functions[type](obj, predefinedVars, isTopLevel);
        if (type === 'BlockStatement' || type === 'ForStatement') {
          return;
        }
      }
      for (var key in obj) {
        if (_typeof(obj[key]) === 'object') {
          if (doNotParse[obj.type] && doNotParse[obj.type].indexOf(key) > -1) {
            continue;
          }
          walk(obj[key]);
        }
      }
      return;
    }

    walk(tree.body);

    (0, _utils.cleanArray)(predefinedVars);
  }
};