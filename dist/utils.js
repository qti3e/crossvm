'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cloneArray = cloneArray;
exports.clone = clone;
exports.cleanArray = cleanArray;
exports.shortId = shortId;
exports.createGlobalRef = createGlobalRef;
var IS_WEB = exports.IS_WEB = typeof window !== 'undefined';
var IS_NODE = exports.IS_NODE = !IS_WEB;
var globalEval = exports.globalEval = eval;

function cloneArray(array) {
  return Array.from(array);
}

function clone(obj) {
  if (obj instanceof Array) {
    return cloneArray(obj);
  }
  return Object.assign({}, obj);
}

function cleanArray(arr) {
  if (!arr instanceof Array) {
    return;
  }
  while (arr.length) {
    arr.shift();
  }
}

function shortId() {
  var ret = [];
  for (var i = 0; i < 6; i += 1) {
    ret.push(Math.floor(Math.random() * (125 - 33)) + 33);
  }
  ret = ret.map(function (x) {
    return String.fromCharCode(x);
  });
  return ret.join('');
}

function createGlobalRef(obj) {
  var id = shortId();
  global.crossVMRefs[id] = obj;
  return 'global.crossVMRefs[\'' + id + '\']';
}