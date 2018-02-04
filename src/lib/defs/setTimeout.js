import {IS_NODE} from '../utils';

export default function (pub) {
  return function (...args) {
    let timerId = setTimeout(...args);
    if(IS_NODE) {
      pub({type: 'push', data: 'timeout'});
    } else {
      pub({type: 'push', data: timerId});
    }
    return timerId;
  };
}
