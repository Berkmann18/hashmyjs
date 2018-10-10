const clr = require('colors/safe');

/**
 * @fileoverview Utility module for HMJ.
 * @module
 */

clr.setTheme(require('./clr'));

/**
 * @description STDOUT log.
 * @param {*} data Data to print
 * @example log('Lorem ipsum dolore sit amet');
 */
const log = (...data) => process.stdout.write(...data);

/**
 * @description Print an error.
 * @param {...*} data Data to print
 * @example error('Something wrong happened with', new Error(this));
 * @see log
 */
const error = (...data) => log(clr.err(data.join(' ')) + '\n');

/**
 * @description Print an information.
 * @param {...*} data Data to print
 * @example info('Welcome John');
 * @see log
 */
const info = (...data) => log(clr.inf(data.join(' ')) + '\n');

/**
 * @description Print a debug message.
 * @param {...*} data Data to print
 * @example dbg('i=', i);
 * @see log
 */
const dbg = (...data) => log(clr.debug(data.join(' ')) + '\n');

/**
 * @description Print an output.
 * @param {...*} data Data to print
 * @example out('1 + 1 = ${rpc('1 1 +')}`);
 * @see log
 */
const out = (...data) => log(clr.out(data.join(' ')) + '\n');

/**
 * @description Print an input.
 * @param {...*} data Data to print
 * @example inp(name);
 * @see log
 */
const inp = (...data) => log(clr.in(data.join(' ')) + '\n');

/**
 * @description Print a warning.
 * @param {...*} data Data to print
 * @example warn('The following function is deprecated');
 * @see log
 */
const warn = (...data) => log(clr.warn(data.join(' ')) + '\n');

/**
 * @description Print a question.
 * @param {...*} data Data to print
 * @example quest('What is your username?');
 * @see log
 */
const quest = (...data) => log(clr.quest(data.join(' ')) + '\n');

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

module.exports = { error, info, dbg, out, inp, warn, quest, IoError, log }