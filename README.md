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
# Example
```js
import {createContext, run} from 'crossvm';
const context1 = createContext();
const context2 = createContext();
run('a = 3', context1);
run('a = 5', context2);
assert(context1.get('a') === 3); // true
assert(context1.get('a') === 5); // true
let job = run(`console.log('Hello from CrossVM')`);
job.on('write', (event) => {
  // event:
  // { type: 'log', data: [ 'Hello from CrossVM' ], time: 1517771857553 }
});
```
