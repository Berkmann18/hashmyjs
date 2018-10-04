const clr = require('colors/safe');

clr.setTheme(require('./clr'));

/**
 * @description Print an error.
 * @param {...*} data Data to print
 */
const error = (...data) => {
  console.error(clr.err(data.join(' ')));
  // process.exit(1);
};

/**
 * @description Print an information.
 * @param {...*} data Data to print
 */
const info = (...data) => console.log(clr.inf(data.join(' ')));

/**
 * @description Print a debug message.
 * @param {...*} data Data to print
 */
const dbg = (...data) => console.log(clr.debug(data.join(' ')));

/**
 * @description Print an output.
 * @param {...*} data Data to print
 */
const out = (...data) => console.log(clr.out(data.join(' ')));

/**
 * @description Print an input.
 * @param {...*} data Data to print
 */
const inp = (...data) => console.log(clr.in(data.join(' ')));

/**
 * @description Print a warning.
 * @param {...*} data Data to print
 */
const warn = (...data) => console.warn(clr.warn(data.join(' ')));

/**
 * @description Print a question.
 * @param {...*} data Data to print
 */
const quest = (...data) => console.log(clr.quest(data.join(' ')));

/**
 * I/O error.
 */
class IoError extends Error {
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
 */
const log = (...data) => process.stdout.write(...data);

module.exports = { error, info, dbg, out, inp, warn, quest, IoError, log }