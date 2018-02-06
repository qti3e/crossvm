import {createContext, run} from '../index';
import {global} from '../utils';

const noop = function () {};

export default function (pub) {
  return function (...args) {
    if(!args.length) {
      return noop;
    }
    const code = args.splice(args.length - 1)[0];
    // todo check args name and throw 'Error: Unexpected token'
    return function (...params) {
      let sandbox = {};
      for(let key in global.crossVMDef) {
        if(key) {
          sandbox[key] = global.crossVMDef[key](pub);
        }
      }
      for(let i = 0; i < args.length; i += 1) {
        sandbox[args[i]] = params[i];
      }
      const context = createContext(sandbox);
      return run(code, context).result;
    };
  };
}
