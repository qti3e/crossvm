import {global, globalEval, getGName, shortId} from '../utils';
import Transpiler from '../transpiler';

if(!global.crossVMRefs) {
  global.crossVMRefs = {};
}

export const contextifySymbol = Symbol('contextSymbol');
// We don't use it in this tiny implementation but it's part of original
// implementation
export const kParsingContext = Symbol('kParsingContext');

export class ContextifyScript {
  constructor(code) {
    this.code = code;
    this.compile = this.compile.bind(this);
    this.runInContext = this.runInContext.bind(this);
    this.runInThisContext = this.runInThisContext.bind(this);
  }

  compile() {
    if(this.runInGlobalScope) {
      eval(this.code);
      return;
    }
    let transpiledCode = Transpiler(this.code);
    let code = `
    (function (global){
      ${transpiledCode}
    })(${this.contextVariableRef})
    `;
    globalEval(code);
  }

  runInThisContext() {
    this.contextVariableRef = 'this';
    this.runInGlobalScope = true;
    return this.compile();
  }

  runInContext(contextifiedSandbox) {
    this.contextVariableRef = contextifiedSandbox[contextifySymbol];
    this.runInGlobalScope = false;
    return this.compile();
  }
}

export function makeContext(sandbox) {
  let id = shortId();
  sandbox[contextifySymbol] = `${getGName()}.crossVMRefs['${id}']`;
  global.crossVMRefs[id] = sandbox;
  return sandbox;
}

export function isContext(sandbox) {
  return typeof sandbox[contextifySymbol] === 'string';
}
