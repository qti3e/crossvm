let reDefine = ['log', 'error', 'warn', 'info'];

export default function (pub) {
  const re = Object.assign({}, console);
  for(let key of reDefine) {
    re[key] = (...args) => pub({type: 'write', data: {type: key, data: args}});
  }
  return re;
}
