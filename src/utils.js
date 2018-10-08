const clr = require('colors/safe');

/**
 * @fileoverview Utility module for HMJ.
 * @module
 */

clr.setTheme(require('./clr'));

/**
 * @description Print an error.
 * @param {...*} data Data to print
 * @example error('Something wrong happened with', new Error(this));
 */
const error = (...data) => {
  console.error(clr.err(data.join(' ')));
  // process.exit(1);
};

/**
 * @description Print an information.
 * @param {...*} data Data to print
 * @example info('Welcome John');
 */
const info = (...data) => console.log(clr.inf(data.join(' ')));

/**
 * @description Print a debug message.
 * @param {...*} data Data to print
 * @example dbg('i=', i);
 */
const dbg = (...data) => console.log(clr.debug(data.join(' ')));

/**
 * @description Print an output.
 * @param {...*} data Data to print
 * @example out('1 + 1 = ${rpc('1 1 +')}`);
 */
const out = (...data) => console.log(clr.out(data.join(' ')));

/**
 * @description Print an input.
 * @param {...*} data Data to print
 * @example inp(name);
 */
const inp = (...data) => console.log(clr.in(data.join(' ')));

/**
 * @description Print a warning.
 * @param {...*} data Data to print
 * @example warn('The following function is deprecated');
 */
const warn = (...data) => console.warn(clr.warn(data.join(' ')));

/**
 * @description Print a question.
 * @param {...*} data Data to print
 * @example quest('What is your username?');
 */
const quest = (...data) => console.log(clr.quest(data.join(' ')));

/**
 * @description I/O error.
 * @example new IoError('File not found');
 */
class IoError extends Error {
  /**
   * Creates and I/O error.
   * @param {string} message Error message
   * @param {*} context I/O context
   * @memberof IoError
   */
  constructor(message = 'IO error:', context) {
    super();
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.context = context;
  }
}

/**
 * @description STDOUT log.
 * @param {*} data Data to print
 * @example log('Lorem ipsum dolore sit amet');
 */
const log = (...data) => process.stdout.write(...data);

module.exports = { error, info, dbg, out, inp, warn, quest, IoError, log }