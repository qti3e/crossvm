import {IS_NODE} from '../utils';

export default function (pub) {
  if(IS_NODE) {
    return setInterval;
  }
  return function (...args) {
    let timerId = setInterval(...args);
    pub({type: 'push', data: timerId});
    return timerId;
  };
}
