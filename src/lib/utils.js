export const IS_WEB = typeof window !== 'undefined';
export const IS_NODE = !IS_WEB;
export const globalEval = eval;


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
    ret.push(Math.floor(Math.random() * (125 - 33)) + 33);
  }
  ret = ret.map(x => String.fromCharCode(x));
  return ret.join('');
}

export function createGlobalRef(obj) {
  let id = shortId();
  global.crossVMRefs[id] = obj;
  return `global.crossVMRefs['${id}']`;
}
