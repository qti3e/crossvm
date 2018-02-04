import Bridge from './bridge';
import Job from './job';
import {createGlobalRef, globalEval} from './utils';
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
  this.crossVMDef[name] = method;
}

export function createContext() {
  return createGlobalRef({});
}

export function run(code, context, require) {
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
    `try{
      ${PubRef}({type: 'push', data: 'running'});
      var data = (function(global, require){
        (function(pub, _Defs_){
          for(let key of _Defs_){
            global[key] = _Defs_[key](pub)
          }
        })(${PubRef}, ${global.crossVMDefRef})
        ${code}
      })(${context}, ${RequireRef})
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
