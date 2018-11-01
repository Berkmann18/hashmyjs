'use strict';
/**
 * @description base64(SHA-256) text encoder inspired by {@link https://stackoverflow.com/a/38554505/5893085}.
 * @author Maximilian Berkmann
 * @module hashmyjs
 */
/* eslint-env es6, node */

const readIn = require('./stdin'),
  readFilesSync = require('./files');

/**
 * @description Start the hasher.
 * @param {string[]} [files=[]] List of files to go through
 * @param {Object} obj Configuration
 * @param {string} obj.format Format of the output (text, json, csv)
 * @param {string} obj.input Location of the input (any, stdin, args)
 * @param {string} obj.output Destination for the output (stdout, var, <i>filenames</i>)
 * @param {boolean} obj.prettify Prettify the output
 * @return {(undefined|string[]|string)} Data or nothing
 * @public
 * @example <caption>Reading from files or STDIN</caption>
 * run();
 * @example <caption>Reading from files</caption>
 * run(['index.js']);
 * run(['index.js'], {input: 'args'});
 * @example <caption>Reading from STDIN</caption>
 * run([]);
 * run([], {input: 'stdin'});
 * @example <caption>Reading from files with configurations</caption>
 * run(['index.js', 'index.css'], {format: 'json', output: 'index-hash.json', prettify: true});
 * @example <caption>Reading from STDIN with configurations</caption>
 * run([], {format: 'csv', input: 'stdin', prettify: true});
 */
const run = (files = [], { format = 'text', input = 'any', output = 'stdout', prettify = false } = {}) => {
  const opts = {
    prettify,
    outputDest: output,
    outputFormat: format
  };

  switch (input) {
  case 'stdin':
    return readIn(opts);
  case 'args':
    return readFilesSync(files, opts);
  default: //any
    return files.length ? readFilesSync(files, opts) : readIn(opts);
  }
};

module.exports = {
  run,
  readIn,
  readFilesSync
}
