const clr = require('colors/safe');

clr.setTheme(require('./clr'));

/**
 * @description Print an error.
 * @param {...*} data Data to print
 */
const error = (...data) => {
  console.error(clr.err(...data));
  // process.exit(1);
};

/**
 * @description Print an information.
 * @param {...*} data Data to print
 */
const info = (...data) => console.log(clr.inf(...data));

/**
 * @description Print a debug message.
 * @param {...*} data Data to print
 */
const dbg = (...data) => console.log(clr.debug(...data));

/**
 * @description Print an output.
 * @param {...*} data Data to print
 */
const out = (...data) => console.log(clr.out(...data));

/**
 * @description Print an input.
 * @param {...*} data Data to print
 */
const inp = (...data) => console.log(clr.in(...data));

/**
 * @description Print a warning.
 * @param {...*} data Data to print
 */
const warn = (...data) => console.warn(clr.warn(...data));

/**
 * @description Print a question.
 * @param {...*} data Data to print
 */
const quest = (...data) => console.log(clr.quest(...data));

/**
 * @description IO error.
 * @param {string} type IO type (open, read, write, append, ...)
 * @param {Error} err Error
 * @param {string} filename Name of the file affected
 */
const IoError = (type, err, filename) => {
  throw new Error(`IO ${type} error:`, err, `on '${filename}'`);
}

/**
 * @description STDOUT log.
 * @param {*} data Data to print
 */
const log = (...data) => process.stdout.write(...data);

module.exports = { error, info, dbg, out, inp, warn, quest, IoError, log }