import {IS_NODE} from '../utils';

export default function (pub) {
  if(IS_NODE) {
    return clearTimeout;
  }
  return function (timerId) {
    pub({type: 'rm', data: timerId});
    return clearTimeout(timerId);
  };
}
