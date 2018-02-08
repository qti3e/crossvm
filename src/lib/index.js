import {IS_NODE} from './utils';
import WebVM from './vm';
let vm = WebVM;

// todo use WebVM in test environment
if(IS_NODE) {
  vm = require('vm');
}

module.exports = vm;
