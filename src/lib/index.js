import Bridge from './bridge';
import Job from './job';
import {createGlobalRef, globalEval, global} from './utils';
import Transpiler from './transpiler';

import VMConsole from './defs/console';
import VMClearInterval from './defs/clearInterval';
import VMClearTimeout from './defs/clearTimeout';
import VMSetTimeout from './defs/setTimeout';
import VMSetInterval from './defs/setInterval';

if(!global.crossVMInit) {
  global.crossVMInit = true;
  global.crossVMRefs = {};
  global.crossVMDef = {
    // console: ...
    console: VMConsole,
    clearInterval: VMClearInterval,
    clearTimeout: VMClearTimeout,
    setTimeout: VMSetTimeout,
    setInterval: VMSetInterval
  };
  global.crossVMRequire = createGlobalRef(require);
  global.crossVMDefRef = createGlobalRef(global.crossVMDef);
}

export function registerVMDef(name, method) {
  global.crossVMDef[name] = method;
}

export function createContext() {
  let ref = createGlobalRef({});
  return {
    ref,
    get(name) {
      return globalEval(`${ref}.${name}`);
    },
    getSandbox() {
      return globalEval(`${ref}`);
    }
  };
}

export function run(code, context, require) {
  context = context.ref;
  let bridge = new Bridge();
  let PubRef = createGlobalRef(bridge) + '.pub';
  let RequireRef = typeof require === 'string' ? require : null;
  if(!RequireRef) {
    RequireRef = typeof require === 'function' ?
      createGlobalRef(require) :
      global.crossVMRequire;
  }
  let job = new Job(bridge);
  try {
    code = Transpiler(code);
    code =
    `
    try{
      ${PubRef}({type: 'push', data: 'running'});
      var data = (function(global, pub, _Defs_, require){
        (function(){
          for(let key in _Defs_){
            global[key] = _Defs_[key](pub)
          }
        })()
        ${code}
      })(${context},${PubRef}, ${global.crossVMDefRef}, ${RequireRef})
      ${PubRef}({type: 'result', data: data})
      ${PubRef}({type: 'rm', data: 'running'});
    } catch(e){
      ${PubRef}({type: 'crashed', data: e});
    }`;
    globalEval(code);
  } catch (e) {
    bridge.pub({type: 'crashed', data: e});
  }
  return job;
}
