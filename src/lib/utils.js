export const IS_WEB = typeof window !== 'undefined';
export const IS_NODE = !IS_WEB;
export const globalEval = eval;
export const global = globalEval(IS_WEB ? 'window' : 'global');

export function cloneArray(array) {
  return Array.from(array);
}

export function clone(obj) {
  if(obj instanceof Array) {
    return cloneArray(obj);
  }
  return Object.assign({}, obj);
}

export function cleanArray(arr) {
  if(!arr instanceof Array) {
    return;
  }
  while(arr.length) {
    arr.shift();
  }
}

export function shortId() {
  let ret = [];
  for(let i = 0; i < 6; i += 1) {
    let b = Math.random() >= 0.5 ? 97 - 65 : 0;
    ret.push(Math.floor(Math.random() * (90 - 65)) + 65 + b);
  }
  ret = ret.map(x => String.fromCharCode(x));
  return ret.join('');
}

export function getGName() {
  return IS_NODE ? 'global' : 'window';
}

export function createGlobalRef(obj) {
  let id = shortId();
  global.crossVMRefs[id] = obj;
  return `${getGName()}.crossVMRefs['${id}']`;
}
