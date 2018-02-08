// Just change a littlebit of original code so we will support all of VM's API

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

import {
  ContextifyScript,
  kParsingContext,

  makeContext,
  isContext
} from '../contextify';

// The binding provides a few useful primitives:
// - Script(code, { filename = "evalmachine.anonymous",
//                  displayErrors = true } = {})
//   with methods:
//   - runInThisContext({ displayErrors = true } = {})
//   - runInContext(sandbox, { displayErrors = true, timeout = undefined } = {})
// - makeContext(sandbox)
// - isContext(sandbox)
// From this we build the entire documented API.

class Script extends ContextifyScript {
  constructor(code, options) {
    // Calling `ReThrow()` on a native TryCatch does not generate a new
    // abort-on-uncaught-exception check. A dummy try/catch in JS land
    // protects against that.
    try {
      super(code, options);
    } catch (e) {
      /* node-do-not-add-exception-line */
      throw e;
    }
  }
}

function getContextOptions(options) {
  const contextOptions = options ? {
    name: options.contextName,
    origin: options.contextOrigin
  } : {};
  if(typeof contextOptions.name !== 'undefined' &&
      typeof contextOptions.name !== 'string') {
    throw new Error('ERR_INVALID_ARG_TYPE', 'options.contextName',
      'string', contextOptions.name);
  }
  if(typeof contextOptions.origin !== 'undefined' &&
      typeof contextOptions.origin !== 'string') {
    throw new Error('ERR_INVALID_ARG_TYPE', 'options.contextOrigin',
      'string', contextOptions.origin);
  }
  return contextOptions;
}

let defaultContextNameIndex = 1;
function createContext(sandbox, options) {
  if(typeof sandbox === 'undefined') {
    sandbox = {};
  } else if(isContext(sandbox)) {
    return sandbox;
  }

  if(typeof options !== 'undefined') {
    if(typeof options !== 'object' || options === null) {
      throw new Error('ERR_INVALID_ARG_TYPE', 'options',
        'object', options);
    }
    options = {
      name: options.name,
      origin: options.origin
    };
    if(typeof options.name === 'undefined') {
      defaultContextNameIndex += 1;
      options.name = `VM Context ${defaultContextNameIndex}`;
    } else if(typeof options.name !== 'string') {
      throw new Error('ERR_INVALID_ARG_TYPE', 'options.name',
        'string', options.name);
    }
    if(typeof options.origin !== 'undefined' && typeof options.origin !== 'string') {
      throw new Error('ERR_INVALID_ARG_TYPE', 'options.origin',
        'string', options.origin);
    }
  } else {
    defaultContextNameIndex += 1;
    options = {
      name: `VM Context ${defaultContextNameIndex}`
    };
  }
  makeContext(sandbox, options);
  return sandbox;
}

function createScript(code, options) {
  return new Script(code, options);
}

function runInContext(code, contextifiedSandbox, options) {
  if(typeof options === 'string') {
    options = {
      filename: options,
      [kParsingContext]: contextifiedSandbox
    };
  } else {
    options = Object.assign({}, options, {
      [kParsingContext]: contextifiedSandbox
    });
  }
  return createScript(code, options)
    .runInContext(contextifiedSandbox, options);
}

function runInNewContext(code, sandbox, options) {
  if(typeof options === 'string') {
    options = {filename: options};
  }
  sandbox = createContext(sandbox, getContextOptions(options));
  options = Object.assign({}, options, {
    [kParsingContext]: sandbox
  });
  return createScript(code, options).runInNewContext(sandbox, options);
}

function runInThisContext(code, options) {
  return createScript(code, options).runInThisContext(options);
}

Script.prototype.runInNewContext = function (sandbox, options) {
  const context = createContext(sandbox, getContextOptions(options));
  return this.runInContext(context, options);
};

export {
  Script,
  createContext,
  createScript,
  runInContext,
  runInNewContext,
  runInThisContext,
  isContext
};
