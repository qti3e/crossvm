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
Writing tests is in progress

# Example
Look at Node's VM [official documentation](https://nodejs.org/api/vm.html)

# Note  
CrossVM is not a security mechanism. Do not use it to run untrusted code.  
There is always a way to get out of sandbox like running this code:
```js
"".constructor.constructor("return this")().console.log=()=> { throw new Error("pwnd");}
```

(Thanks to [Dark Marouane](https://www.reddit.com/user/dark-marouane) for clarifying this)
