import {IS_NODE} from '../utils';

export default function (pub) {
  if(IS_NODE) {
    return clearInterval;
  }
  return function (timerId) {
    pub({type: 'rm', data: timerId});
    return clearInterval(timerId);
  };
}
