'use strict';
// tsx 4.x registers itself as a .js transformer for ALL files, including
// node_modules. On Node 24 this breaks CJS packages with dual ESM/CJS exports
// (postcss being the main victim) because tsx's interop wraps module.exports
// in a namespace object. This shim wraps tsx's registered .js handler to
// skip node_modules entirely, passing them to Node's original CJS loader.
const Module = require('node:module');
const path = require('node:path');

const originalJsLoader = Module._extensions['.js'];

// Load tsx CJS register — it will overwrite Module._extensions['.js']
require(path.join(__dirname, '../../node_modules/tsx/dist/cjs/index.cjs'));

const tsxJsLoader = Module._extensions['.js'];

// Re-wrap: use tsx only for project files, fall back to original for node_modules
Module._extensions['.js'] = function (module, filename) {
  if (filename.includes(path.sep + 'node_modules' + path.sep)) {
    return originalJsLoader(module, filename);
  }
  return tsxJsLoader(module, filename);
};
