import {IS_NODE} from '../utils';

export default function (pub) {
  if(IS_NODE) {
    return setTimeout;
  }
  return function (...args) {
    let timerId = setTimeout(...args);
    pub({type: 'push', data: timerId});
    return timerId;
  };
}
