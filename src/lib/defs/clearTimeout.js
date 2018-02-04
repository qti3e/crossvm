import {IS_NODE} from '../utils';

let prop = '_idleTimeout';

export default function (pub) {
  return function (...args) {
    if(IS_NODE) {
      for(let i = 0; i < args.length; i += 1) {
        if(args[i] && args[i][prop]) {
          pub({type: 'rm', data: 'timeout'});
        }
      }
    } else {
      for(let i = 0; i < args.length; i += 1) {
        pub({type: 'rm', data: args[i]});
      }
    }
    return clearTimeout(...args);
  };
}
