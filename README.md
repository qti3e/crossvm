# Cross VM
Browser compatible Node VM  

By using this library you will be able to containerize JS codes and evaluate
 the codes in the browser  

# Install
Sadly for now you can only use NPM to use this package.  
(Webpack-bundle is coming)  
```bash
npm install --save crossvm
```  

# Testing

```bash
git clone https://github.com/Qti3e/crossvm.git
cd crossvm
npm install
npm run test
```

# Example
```js
import {createContext, run} from 'crossvm';
const context1 = createContext();
const context2 = createContext({a: 4});
run('a = 3', context1);
run('a += 5', context2);
assert(context1.get('a') === 3); // true
assert(context2.get('a') === 9); // true
let job = run(`console.log('Hello from CrossVM')`);
job.on('write', (event) => {
  // event:
  // { type: 'log', data: [ 'Hello from CrossVM' ], time: 1517771857553 }
});
```

# Note  
CrossVM is not a security mechanism. Do not use it to run untrusted code.  
There is always a way to get out of sandbox like:
```js
const {createContext, run} = require('crossvm');
const context = createContext();
run('"".constructor.constructor("return this")().console.log=()=> { throw new Error("pwnd");}', context);
console.log("Hello world");
```
(Thanks to [Dark Marouane](https://www.reddit.com/user/dark-marouane) for clarifying this)
