const clr = require('colors/safe');

clr.setTheme(require('./clr'));

/**
 * @description Print an error.
 * @param {...*} data Data to print
 */
const error = (...data) => {
  console.error(clr.err(...data));
  process.exit(1);
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
 * @description IO error message.
 * @param {string} type IO type (open, read, write, append, ...)
 * @param {Error} err Error
 * @param {string} filename Name of the file affected
 */
const ioError = (type, err, filename) => error(`IO ${type} error:`, err, `on '${filename}'`);

/**
 * @description IO error.
 * @param {string} type IO type (open, read, write, append, ...)
 * @param {Error} err Error
 * @param {string} filename Name of the file affected
 */
const IoError = (type, err, filename) => {
  throw new Error(`IO ${type} error:`, err, `on '${filename}'`);
}

module.exports = { error, info, dbg, out, inp, IoError, IoError }