import {IS_NODE} from '../utils';

export default function (pub) {
  return function (...args) {
    let timerId = setInterval(...args);
    if(IS_NODE) {
      pub({type: 'push', data: 'interval'});
    } else {
      pub({type: 'push', data: timerId});
    }
    pub({type: 'push', data: timerId});
    return timerId;
  };
}
