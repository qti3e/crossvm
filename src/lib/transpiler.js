import {cloneArray, cleanArray} from './utils';
import * as acorn from 'acorn';

export const importFunction = 'require';

export const JavaScriptPredefinedValues = (`
Array                 Boolean               Date                  Error
EvalError             Function              Infinity              JSON
Math                  NaN                   Number                Object
RangeError            ReferenceError        RegExp                String
SyntaxError           TypeError             URIError              decodeURI
decodeURIComponent    encodeURI             encodeURIComponent
isFinite              isNaN                 parseFloat            parseInt
undefined             ArrayBuffer           Atomics               Buffer
DataView              Float32Array          Float64Array
Int16Array            Int32Array            Int8Array             Intl
Map                   Promise               Proxy                 Reflect
Set                   SharedArrayBuffer     Symbol                Uint16Array
Uint32Array           Uint8Array            Uint8ClampedArray     WeakMap
WeakSet               WebAssembly           assert
async_hooks           buffer                clearImmediate
clearInterval         clearTimeout          cluster               console
crypto                dgram                 dns                   domain
escape                events
http                  http2                 https                 module
net                   os                    path                  perf_hooks
process               punycode              querystring           readline
repl                  require               root                  setImmediate
setInterval           setTimeout            stream                string_decoder
tls                   tty                   unescape              url
util                  v8                    vm                    zlib
__defineGetter__      __defineSetter__      __lookupGetter__      __lookupSetter__
__proto__             constructor           hasOwnProperty        isPrototypeOf
propertyIsEnumerable  toLocaleString        toString              valueOf
`)
  .split(/\s+/g)
  .map(x => x.trim())
  .filter(x => x !== '');

const acornOptions = {
  allowImportExportEverywhere: true
};

let add2predefinedVars = [];

let changes = [
  // [start, insertText]
];
let removes = [
  // [start, end]
];

function prepend({start}, text) {
  changes.push([start, text]);
}

function append({end}, text) {
  changes.push([end, text]);
}

function remove(obj, end) {
  let start;
  if(end) {
    start = obj;
  } else {
    start = obj.start;
    end = obj.end;
  }
  removes.push([start, end]);
}

function readFunctionParamsName(params) {
  for(let i = 0; i < params.length; i += 1) {
    add2predefinedVars.push(params[i].name || params[i].left.name);
  }
}

const doNotParse = {
  ForStatement: ['init', 'body']
  // FunctionDeclaration: ['body', 'params'],
  // FunctionExpression: ['body', 'params']
};

const Functions = {
  ImportDeclaration(obj, predefinedVars, isTopLevel) {
    let re = [];
    remove(obj);
    const f = `
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    `;
    if(obj.specifiers.length === 0) {
      prepend(obj, `${importFunction}(${obj.source.raw});`);
      return null;
    }

    let declarations = [];
    let declarationPrefix = isTopLevel ? '' : 'let ';
    const prefix = isTopLevel ? 'global.' : '';

    re.push(`const _nb_tmp_ = _interopRequireDefault(${importFunction}(${obj.source.raw}));`);

    for(let specifier of obj.specifiers) {
      if(!isTopLevel) {
        declarations.push(specifier.local.name);
      }
      switch (specifier.type) {
      case 'ImportSpecifier':
        re.push(`${prefix}${specifier.local.name} = _nb_tmp_.${specifier.imported.name};`);
        break;
      case 'ImportDefaultSpecifier':
        re.push(`${prefix}${specifier.local.name} = _nb_tmp_.default;`);
        break;
      case 'ImportNamespaceSpecifier':
        re.push(`${prefix}${specifier.local.name} = _nb_tmp_;`);
        break;
      default:
        break;
      }
    }
    prepend(obj, `${declarationPrefix}${declarations.join()}(function(){${f}${re.join('')}})()`);
    return null;
  },
  ExpressionStatement(obj, predefinedVars) {
    if(!obj.expression || obj.expression.type !== 'Identifier') {
      return null;
    }
    let name = obj.expression.name;
    if(predefinedVars.indexOf(name) > 0) {
      return null;
    }
    return prepend(obj.expression, 'global.');
  },
  ClassDeclaration(obj, predefinedVars, isTopLevel) {
    if(predefinedVars.indexOf(obj.id.name) > -1) {
      return null;
    }
    if(obj.superClass && obj.superClass.type === 'Identifier') {
      if(predefinedVars.indexOf(obj.superClass.name) < 0) {
        prepend(obj.superClass, 'global.');
      }
    }
    if(isTopLevel) {
      prepend(obj, 'global.' + obj.id.name + ' = ');
      remove(obj.id);
    }
    return null;
  },
  ClassExpression(obj, ...etc) {
    if(obj.id) {
      return this.ClassDeclaration(obj, ...etc);
    }
    readFunctionParamsName(obj.params);
    return null;
  },
  FunctionDeclaration(obj, predefinedVars, isTopLevel) {
    readFunctionParamsName(obj.params);
    if(predefinedVars.indexOf(obj.id.name) > -1) {
      return null;
    }
    if(isTopLevel) {
      prepend(obj, 'global.' + obj.id.name + ' = ');
      remove(obj.id);
      return null;
    }
    return null;
  },
  FunctionExpression(obj, ...etc) {
    if(obj.id) {
      return this.FunctionDeclaration(obj, ...etc);
    }
    readFunctionParamsName(obj.params);
    return null;
  },
  VariableDeclaration(obj, predefinedVars, isTopLevel) {
    if(!isTopLevel) {
      for(let i = 0; i < obj.declarations.length; i += 1) {
        predefinedVars.push(obj.declarations[i].id.name);
      }
      return null;
    }
    // remove leading declaration label
    remove(obj.start, obj.declarations[0].start);

    for(let i = 0; i < obj.declarations.length; i += 1) {
      if(i > 0) {
        // remove space and coma between things
        // let a = 5, b
        // let a = 5[, ]b
        remove(obj.declarations[i - 1].end, obj.declarations[i].start);
      }
      if(obj.declarations[i].init === null) {
        append(obj.declarations[i].id, ' = null;');
      } else if(i < obj.declarations.length - 1) {
        append(obj.declarations[i], ';');
      }
      if(obj.declarations[i].init && obj.declarations[i].init.type === 'Identifier') {
        let name = obj.declarations[i].init.name;
        if(predefinedVars.indexOf(name) < 0) {
          prepend(obj.declarations[i].init, 'global.');
        }
      }
      let name = obj.declarations[i].id.name;
      if(predefinedVars.indexOf(name) > -1) {
        prepend(obj.declarations[i].id, obj.kind + ' ');
      } else {
        prepend(obj.declarations[i].id, 'global.');
      }
    }
    return null;
  },
  ForStatement(obj, predefinedVars) {
    predefinedVars = cloneArray(predefinedVars);
    if(obj.init && obj.init.type === 'VariableDeclaration') {
      // add2predefinedVars.push('x')
      for(let i = 0; i < obj.init.declarations.length; i += 1) {
        predefinedVars.push(obj.init.declarations[i].id.name);
      }
    }
    this.BlockStatement(obj, predefinedVars);
    cleanArray(predefinedVars);
  },
  xxxExpression(obj, predefinedVars) {
    let keys = ['object', 'left', 'right', 'callee', 'argument'];
    let re = [];
    while(keys.length) {
      let key = keys.shift();
      if(obj[key] && obj[key].type === 'Identifier') {
        let name = obj[key].name;
        if(predefinedVars.indexOf(name) > -1) {
          continue;
        }
        re.push(prepend(obj[key], 'global.'));
      }
    }
    return re;
  },
  CallExpression(obj, predefinedVars) {
    let re = this.xxxExpression(obj, predefinedVars);
    for(let i = 0; i < obj.arguments.length; i += 1) {
      if(obj.arguments[i].type === 'Identifier') {
        let name = obj.arguments[i].name;
        if(predefinedVars.indexOf(name) > -1) {
          continue;
        }
        re.push(prepend(obj.arguments[i], 'global.'));
      }
    }
    return re;
  },
  ReturnStatement(obj, predefinedVars) {
    if(obj.argument && obj.argument.type === 'Identifier') {
      if(predefinedVars.indexOf(obj.argument.name) === -1) {
        return [prepend(obj.argument, 'global.')];
      }
    }
    return null;
  },
  CatchClause(obj, predefinedVars) {
    predefinedVars.push(obj.param.name);
    return null;
  },
  BlockStatement(tree, predefinedVars) {
    predefinedVars = cloneArray(predefinedVars);
    if(add2predefinedVars) {
      while(add2predefinedVars.length) {
        predefinedVars.push(add2predefinedVars.shift());
      }
    }
    const isTopLevel = tree.type === 'Program';

    if(isTopLevel) {
      changes = [];
      removes = [];
      // insert return for expression
      for(let i = tree.body.length - 1; i > 0; i -= 1) {
        let c = tree.body[i];
        if(c.type === 'VariableDeclaration' || c.type === 'ExpressionStatement') {
          let f = i === 0 ? prepend : append;
          f(tree.body[Math.max(0, i - 1)], 'return ');
          break;
        }
      }
    }

    function walk(obj) {
      if(!obj) {
        return;
      }
      let type = obj.type || '';
      if(type.endsWith('Expression') && !Functions[type]) {
        type = 'xxxExpression';
      }
      if(Functions[type]) {
        Functions[type](obj, predefinedVars, isTopLevel);
        if(type === 'BlockStatement' || type === 'ForStatement') {
          return;
        }
      }
      for(let key in obj) {
        if(typeof obj[key] === 'object') {
          if(doNotParse[obj.type] && doNotParse[obj.type].indexOf(key) > -1) {
            continue;
          }
          walk(obj[key]);
        }
      }
      return;
    }

    walk(tree.body);

    cleanArray(predefinedVars);
  }
};

export default function (code) {
  let tree = acorn.parse(code, acornOptions);
  let vars = JavaScriptPredefinedValues.filter(x => !global.crossVMDef[x]);
  Functions.BlockStatement(tree, [
    ...vars,
    importFunction,
    'global'
  ], true);
  tree = null;

  // merge changes
  changes.sort((a, b) => a[0] - b[0]);

  changes = changes.filter((x, i) => i === 0 || !(
    changes[i - 1][0] === x[0] &&
    changes[i - 1][1] === x[1]
  ));

  let tmp = [];
  for(let i = 0; i < removes.length; i += 1) {
    let [s, e] = removes[i];
    for(let j = s; j < e; j += 1) {
      tmp.push(j);
    }
  }
  cleanArray(removes);
  removes = tmp;
  removes = removes.filter((x, i) => removes.indexOf(x) === i);
  removes.sort((a, b) => a - b);
  code = code.split('');
  let re = [];

  for(let i = 0; i < code.length; i += 1) {
    while(changes[0] && changes[0][0] === i) {
      let change = changes.
        shift();
      re.push(change[1]);
    }
    if(removes[0] === i) {
      removes.shift();
      continue;
    }
    re.push(code[i]);
  }

  return re.join('');
}
